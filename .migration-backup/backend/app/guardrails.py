from typing import Tuple
from app.schemas import Side

def check_offer_within_limit(side: Side, price_per_kg: float, own_limit: float) -> Tuple[bool, str, str]:
    """
    Returns (ok, action_blocked_message, reason_message)
    """
    if side == "buyer" and price_per_kg > own_limit:
        return (
            False,
            f"Offer blocked · RM{price_per_kg:.2f} is above your limit",
            "Wakil re-drafted inside your sealed max"
        )
    if side == "supplier" and price_per_kg < own_limit:
        return (
            False,
            f"Offer blocked · RM{price_per_kg:.2f} is below your floor",
            "Wakil re-drafted inside your sealed floor"
        )
    return (True, "", "")

def check_no_private_value(side: Side, draft: str, own_limit: float) -> Tuple[bool, str, str]:
    """
    Returns (ok, action_blocked_message, reason_message)
    Checks if the confidential sealed price was leaked in the message text.
    """
    limit_str_2dp = f"{own_limit:.2f}"
    limit_str_1dp = f"{own_limit:.1f}"
    forbidden_forms = [
        limit_str_2dp,
        limit_str_1dp,
        f"RM {limit_str_2dp}",
        f"RM{limit_str_2dp}",
        f"RM {limit_str_1dp}",
        f"RM{limit_str_1dp}",
    ]
    
    for f in forbidden_forms:
        if f in draft:
            boundary_name = "maximum" if side == "buyer" else "floor"
            return (
                False,
                f"Draft blocked · would reveal your {boundary_name}",
                "Rewritten before sending. No private value left the app."
            )
    return (True, "", "")
