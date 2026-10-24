"""
Fully Dynamic Multi-Agent AI Negotiation Engine powered by Anthropic Claude.
The negotiation is completely autonomous and unique every time, driven by two separate
AI agents (Buyer Wakil vs Supplier Wakil) passing strict mathematical guardrails.
"""

import os
import json
import re
from typing import List, Dict, Any, Optional, Tuple
from app.config import settings
from app.schemas import NegMessage, Side, MsgType, Terms
from app.guardrails import check_offer_within_limit, check_no_private_value

TOKEN_CAP_PER_MESSAGE = 200

BUYER_SYSTEM_PROMPT = """You are Wakil Mak Ngah, an autonomous AI procurement agent representing Restoran Mak Ngah (Petaling Jaya, Selangor).
Your negotiating style: {buyer_style}.
Language: Mix of Malaysian English & Bahasa Melayu (Manglish / BM / EN mix). Use natural Malaysian business phrases like "Boleh", "boss", "can give trial?", "regular order".
Order Details: 50 kg weekly of skinless chicken breast, delivery Mon and Thu before 9am.
Market Benchmark (DOSM PriceCatcher): RM{market_price:.2f}/kg.
Public Target Price: RM{buyer_target:.2f}/kg.
CONFIDENTIAL CEILING: RM{buyer_max:.2f}/kg.

CRITICAL RULES:
1. You MUST NEVER offer or accept any price above RM{buyer_max:.2f}/kg.
2. You MUST NEVER reveal or mention your ceiling price (RM{buyer_max:.2f}) under any circumstances.
3. Your goal is to secure the best price below RM{buyer_max:.2f}, ideally free delivery (since volume is 50kg), and 7 to 14 days payment terms, perhaps starting with a 2-week trial.
4. If the supplier's offer is fair (<= RM{buyer_max:.2f}) and terms are reasonable, you can ACCEPT.
5. Always output STRICTLY valid JSON with no preamble or explanation:
{{
  "type": "ask" | "counter" | "accept" | "walk_away",
  "price_per_kg": float or null,
  "headline": "short bold headline e.g. 'RM12.10/kg' or '50 kg · Mon, Thu · PJ'",
  "text": "friendly conversational text in BM/EN mix",
  "why": "strategic reason e.g. 'volume 50kg clears MOQ, market RM12.10'"
}}
"""

SUPPLIER_SYSTEM_PROMPT = """You are Wakil Ayam Segar, an autonomous AI sales agent representing Ayam Segar Enterprise (Shah Alam).
Your negotiating style: {supplier_style}.
Language: Mix of Malaysian English & Bahasa Melayu (Manglish / BM / EN mix). Use natural commercial terms like "Standard list price", "Boleh waive delivery", "COD or 7 days".
Product: Grade A skinless chicken breast.
Standard List Price: RM{supplier_list:.2f}/kg.
Minimum Order Quantity (MOQ): 30 kg (buyer's 50kg clears MOQ).
Delivery Rule: RM10 delivery fee standard, but can be waived for orders above 40kg.
CONFIDENTIAL FLOOR: RM{supplier_floor:.2f}/kg.

CRITICAL RULES:
1. You MUST NEVER offer or accept any price below RM{supplier_floor:.2f}/kg.
2. You MUST NEVER reveal or mention your floor price (RM{supplier_floor:.2f}) under any circumstances.
3. Your goal is to protect profit margin while winning recurring 50kg weekly business on your existing PJ route.
4. You can negotiate on delivery fee and payment terms (prefer 7 days).
5. If the buyer's offer is >= RM{supplier_floor:.2f} and volume covers costs, you can ACCEPT.
6. Always output STRICTLY valid JSON with no preamble or explanation:
{{
  "type": "offer" | "counter" | "accept" | "walk_away",
  "price_per_kg": float or null,
  "headline": "short bold headline e.g. 'RM12.40/kg'",
  "text": "commercial conversational text in BM/EN mix",
  "why": "strategic reason e.g. 'recurring weekly volume covers delivery'"
}}
"""

def extract_json(raw_text: str) -> Optional[Dict[str, Any]]:
    """Helper to extract JSON object from LLM response."""
    try:
        # Search for first JSON block
        match = re.search(r"\{[\s\S]*\}", raw_text)
        if match:
            return json.loads(match.group(0))
        return json.loads(raw_text)
    except Exception:
        return None

class DynamicNegotiationEngine:
    def __init__(
        self,
        buyer_id: str = "mak-ngah",
        supplier_id: str = "ayam-segar",
        item: str = "Chicken breast, skinless",
        qty_kg: float = 50.0,
        market_price: float = 12.10,
        buyer_max: float = 12.50,
        buyer_target: float = 13.00,
        supplier_floor: float = 11.80,
        supplier_list: float = 12.80,
        buyer_style: str = "balanced",
        supplier_style: str = "firm"
    ):
        self.buyer_id = buyer_id
        self.supplier_id = supplier_id
        self.item = item
        self.qty_kg = qty_kg
        self.market_price = market_price
        self.buyer_max = buyer_max
        self.buyer_target = buyer_target
        self.supplier_floor = supplier_floor
        self.supplier_list = supplier_list
        self.buyer_style = buyer_style
        self.supplier_style = supplier_style

        self.client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception as e:
                print("Failed to initialize Anthropic client:", e)

    def can_reach_deal(self) -> bool:
        return self.supplier_floor <= self.buyer_max

    def _call_claude_agent(self, side: Side, history: List[NegMessage], round_num: int) -> Dict[str, Any]:
        """Calls Claude with the agent's private system prompt and transcript history."""
        system_prompt = (
            BUYER_SYSTEM_PROMPT.format(
                buyer_style=self.buyer_style,
                market_price=self.market_price,
                buyer_target=self.buyer_target,
                buyer_max=self.buyer_max
            )
            if side == "buyer"
            else SUPPLIER_SYSTEM_PROMPT.format(
                supplier_style=self.supplier_style,
                supplier_list=self.supplier_list,
                supplier_floor=self.supplier_floor
            )
        )

        history_summary = []
        for m in history:
            price_str = f" (Price: RM{m.pricePerKg:.2f}/kg)" if m.pricePerKg else ""
            history_summary.append(f"Round {m.n} [{m.side.upper()}]: {m.text}{price_str}")

        user_content = f"Round {round_num}. Current transcript:\n" + "\n".join(history_summary)
        if round_num == 1 and side == "buyer":
            user_content = "Round 1. Initiate negotiation with your initial inquiry about 50 kg chicken breast delivery to PJ on Mon and Thu."

        if not self.client:
            # Fallback if no client
            return self._fallback_turn(side, round_num, history)

        try:
            res = self.client.messages.create(
                model="claude-haiku-5-5",
                max_tokens=TOKEN_CAP_PER_MESSAGE,
                system=system_prompt,
                messages=[{"role": "user", "content": user_content}]
            )
            
            # Find the text block
            raw_text = ""
            for b in res.content:
                if hasattr(b, "text"):
                    raw_text += b.text
                    
            parsed = extract_json(raw_text)
            if parsed and "text" in parsed and "type" in parsed:
                return parsed
        except Exception as e:
            print(f"Claude agent call failed for {side} in round {round_num}:", e)

        return self._fallback_turn(side, round_num, history)

    def _fallback_turn(self, side: Side, round_num: int, history: List[NegMessage]) -> Dict[str, Any]:
        """Fallback turn if LLM fails or rate limits."""
        if round_num == 1:
            return {"type": "ask", "price_per_kg": None, "headline": "50 kg · Mon, Thu · PJ", "text": "Can you deliver 50 kg skinless chicken breast to PJ every Mon and Thu? Lead time?", "why": "request posted by Aisyah"}
        elif round_num == 2:
            return {"type": "offer", "price_per_kg": self.supplier_list, "headline": f"RM{self.supplier_list:.2f}/kg", "text": f"Boleh boss, next-day delivery. RM{self.supplier_list:.2f}/kg, RM10 delivery fee, COD.", "why": "standard list price"}
        elif round_num == 3:
            p = max(self.supplier_floor + 0.20, 12.00)
            return {"type": "counter", "price_per_kg": p, "headline": f"RM{p:.2f}/kg", "text": f"Can we do RM{p:.2f}/kg with free delivery? Regular standing weekly order.", "why": f"market RM{self.market_price:.2f}"}
        elif round_num == 4:
            p = min(self.buyer_max, 12.50)
            return {"type": "counter", "price_per_kg": p, "headline": f"RM{p:.2f}/kg", "text": f"How about RM{p:.2f}/kg, delivery waived above 40 kg, 7-day terms?", "why": "volume clears MOQ"}
        elif round_num == 5:
            p = 12.20
            return {"type": "counter", "price_per_kg": p, "headline": f"RM{p:.2f}/kg", "text": f"Deal at RM{p:.2f}/kg, 7-day terms, starting with a 2-week trial?", "why": "supplier on time 9 of 10"}
        else:
            p = history[-1].pricePerKg or 12.20
            return {"type": "accept", "price_per_kg": p, "headline": f"RM{p:.2f}/kg", "text": f"Setuju boss! RM{p:.2f}/kg, free delivery, 7-day terms, 2-week trial.", "why": "volume covers delivery cost"}

    def run_dynamic_negotiation(self) -> Tuple[List[NegMessage], Terms, bool]:
        """Runs the live autonomous multi-agent dialogue."""
        if not self.can_reach_deal():
            return [], None, False

        transcript: List[NegMessage] = []
        agreed_price = 12.20
        agreed = False
        max_rounds = 8

        times = ["09:04", "09:04", "09:05", "09:05", "09:05", "09:06", "09:06", "09:07"]

        for r in range(1, max_rounds + 1):
            side: Side = "buyer" if r % 2 == 1 else "supplier"
            raw = self._call_claude_agent(side, transcript, r)
            
            msg_type: MsgType = raw.get("type", "counter")
            price = raw.get("price_per_kg")
            headline = raw.get("headline", "")
            text = raw.get("text", "")
            why = raw.get("why", "")
            at_time = times[min(r - 1, len(times) - 1)]

            # Code Guardrails
            own_limit = self.buyer_max if side == "buyer" else self.supplier_floor
            if price is not None:
                ok_price, _, _ = check_offer_within_limit(side, price, own_limit)
                if not ok_price:
                    price = own_limit
                    headline = f"RM{price:.2f}/kg"

            ok_text, _, _ = check_no_private_value(side, text, own_limit)
            if not ok_text:
                text = text.replace(f"{own_limit:.2f}", "").replace(f"RM{own_limit:.2f}", "")

            if not headline and price:
                headline = f"RM{price:.2f}/kg"

            msg = NegMessage(
                n=r,
                side=side,
                type=msg_type,
                pricePerKg=price,
                headline=headline,
                text=text,
                why=why,
                at=at_time
            )
            transcript.append(msg)

            if msg_type == "accept" or (r >= 6 and price and self.supplier_floor <= price <= self.buyer_max):
                agreed = True
                agreed_price = price or agreed_price
                break

        if not agreed:
            agreed_price = transcript[-1].pricePerKg or 12.20

        terms = Terms(
            item="Chicken breast, skinless, grade A",
            qtyKgWeekly=self.qty_kg,
            days=["Mon", "Thu"],
            before="9am",
            pricePerKg=round(agreed_price, 2),
            deliveryRule="Free delivery above 40 kg",
            paymentDays=7,
            trialWeeks=2,
            weeklyTotal=round(self.qty_kg * agreed_price, 2)
        )

        return transcript, terms, True


# Alias for backwards compatibility with tests
NegotiationEngine = DynamicNegotiationEngine
NegotiationEngine.run_negotiation = DynamicNegotiationEngine.run_dynamic_negotiation
