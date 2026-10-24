from typing import List, Optional, Literal, Union, Dict, Any
from pydantic import BaseModel, Field

# Base model that preserves camelCase aliases when exported to JSON
class CamelModel(BaseModel):
    class Config:
        populate_by_name = True
        alias_generator = None

Side = Literal["buyer", "supplier"]
Role = Literal["owner", "staff"]
MsgType = Literal["ask", "offer", "counter", "accept", "walk_away"]
DealStatus = Literal["proposed", "buyer_approved", "supplier_approved", "sealed", "rejected"]
LogKind = Literal["human", "agent", "approval", "rule"]
WakilColor = Literal["purple", "plum", "indigo", "teal"]
WakilHat = Literal["chef", "songkok", "cap", "headset", "none"]
WakilFace = Literal["happy", "focus", "calm"]
ChipTone = Literal["ok", "warn", "bad", "neutral"]

class NegMessage(CamelModel):
    n: int
    side: Side
    type: MsgType
    pricePerKg: Optional[float] = Field(default=None, alias="pricePerKg")
    headline: str
    text: str
    why: str
    at: str

class Terms(CamelModel):
    item: str
    qtyKgWeekly: float = Field(..., alias="qtyKgWeekly")
    days: List[str]
    before: str
    pricePerKg: float = Field(..., alias="pricePerKg")
    deliveryRule: str = Field(..., alias="deliveryRule")
    paymentDays: int = Field(..., alias="paymentDays")
    trialWeeks: Optional[int] = Field(default=None, alias="trialWeeks")
    weeklyTotal: float = Field(..., alias="weeklyTotal")

class Approval(CamelModel):
    by: str
    side: Side
    role: Role
    at: str

class Deal(CamelModel):
    id: str
    negotiationId: str = Field(..., alias="negotiationId")
    buyerId: str = Field(..., alias="buyerId")
    supplierId: str = Field(..., alias="supplierId")
    status: DealStatus
    terms: Terms
    approvals: List[Approval]
    askedOwnerAt: Optional[str] = Field(default=None, alias="askedOwnerAt")
    poNumber: Optional[str] = Field(default=None, alias="poNumber")

class LogRow(CamelModel):
    id: str
    kind: LogKind
    action: str
    actor: str
    reason: str
    at: str
    staffVisible: bool = Field(..., alias="staffVisible")
    side: Union[Side, Literal["both"]]

class LogRowCreate(CamelModel):
    kind: LogKind
    action: str
    actor: str
    reason: str
    staffVisible: bool = Field(..., alias="staffVisible")
    side: Union[Side, Literal["both"]]
    at: Optional[str] = None
    key: Optional[str] = None

class WakilProfile(CamelModel):
    name: str
    color: WakilColor
    hat: WakilHat
    face: WakilFace
    lang: Literal["en", "bm", "mix"]
    tone: Literal["friendly", "formal"]
    notes: str
    lookNote: str = Field(default="", alias="lookNote")

class CounterpartChip(CamelModel):
    label: str
    tone: ChipTone

class CounterpartTile(CamelModel):
    label: str
    value: str

class Counterpart(CamelModel):
    id: str
    name: str
    logo: str
    location: str
    fit: int
    chips: List[CounterpartChip]
    tiles: List[CounterpartTile]
    why: str
    listLabel: str = Field(..., alias="listLabel")
    panel: str
    accent: str
    opensAt: str = Field(..., alias="opensAt")

class Business(CamelModel):
    id: str
    name: str
    short: str
    owner: str
    logo: str
    side: Side
    location: str

class Band(CamelModel):
    lo: float
    hi: float

class Scale(CamelModel):
    lo: float
    hi: float

class NegotiationView(CamelModel):
    id: str
    viewer: Side
    buyerId: str = Field(..., alias="buyerId")
    supplierId: str = Field(..., alias="supplierId")
    item: str
    qtyLabel: str = Field(..., alias="qtyLabel")
    marketPerKg: float = Field(..., alias="marketPerKg")
    ownLimitPerKg: float = Field(..., alias="ownLimitPerKg")
    band: Band
    scale: Scale
    messages: List[NegMessage]
    maxMessages: int = Field(default=10, alias="maxMessages")
    dealId: str = Field(..., alias="dealId")
    result: Literal["deal", "no_deal"]

# Request & Response helper schemas
class StartNegotiationRequest(CamelModel):
    side: Side
    counterpartId: str = Field(..., alias="counterpartId")

class StartNegotiationResponse(CamelModel):
    id: str
    noDeal: bool = Field(..., alias="noDeal")

class PostRequestPayload(CamelModel):
    item: Optional[str] = "Chicken breast, skinless, grade A"
    qtyKgWeekly: Optional[float] = 50.0
    days: Optional[List[str]] = ["Mon", "Thu"]
    targetPrice: Optional[float] = 13.00

class ApproveRequest(CamelModel):
    side: Side
    role: Role

class ApproveResponse(CamelModel):
    ok: bool
    deal: Optional[Deal] = None
    reason: Optional[Literal["above_limit", "already", "rejected"]] = None

class RejectRequest(CamelModel):
    side: Side
    role: Role
    reason: str

class CounterRequest(CamelModel):
    side: Side
    role: Role
    note: str
