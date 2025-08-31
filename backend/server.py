from fastapi import FastAPI, APIRouter, Request, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from enum import Enum
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Stripe integration
stripe_api_key = os.environ.get('STRIPE_API_KEY')
if not stripe_api_key:
    raise ValueError("STRIPE_API_KEY not found in environment variables")

# Services Configuration
SERVICES = {
    "amor": {
        "name": "Ritual de Amor",
        "description": "Ritual para atrair o amor verdadeiro e fortalecer relacionamentos",
        "price": 297.00,
        "duration": "3-7 dias",
        "image": "https://images.unsplash.com/photo-1666730098837-f9ef89a37183?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxyaXR1YWwlMjBjYW5kbGVzfGVufDB8fHx8MTc1NjY2Mzc0OXww&ixlib=rb-4.1.0&q=85"
    },
    "protecao": {
        "name": "Ritual de Proteção",
        "description": "Proteção contra energias negativas e inveja",
        "price": 197.00,
        "duration": "1-3 dias",
        "image": "https://images.unsplash.com/photo-1560427450-00fa9481f01e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjcnlzdGFsc3xlbnwwfHx8fDE3NTY2NjM3NTR8MA&ixlib=rb-4.1.0&q=85"
    },
    "prosperidade": {
        "name": "Ritual de Prosperidade",
        "description": "Atração de abundância financeira e oportunidades",
        "price": 397.00,
        "duration": "7-14 dias",
        "image": "https://images.unsplash.com/photo-1527380992061-b126c88cbb41?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMHNwaXJpdHVhbHxlbnwwfHx8fDE3NTY2NjM3NDN8MA&ixlib=rb-4.1.0&q=85"
    },
    "limpeza": {
        "name": "Limpeza Energética",
        "description": "Limpeza espiritual profunda e renovação das energias",
        "price": 147.00,
        "duration": "1 dia",
        "image": "https://images.unsplash.com/photo-1696562535437-d542584811bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwzfHxyaXR1YWwlMjBjYW5kbGVzfGVufDB8fHx8MTc1NjY2Mzc0OXww&ixlib=rb-4.1.0&q=85"
    }
}

# Define Models
class PaymentStatus(str, Enum):
    INITIATED = "initiated"
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"

class ServiceType(str, Enum):
    AMOR = "amor"
    PROTECAO = "protecao"
    PROSPERIDADE = "prosperidade"
    LIMPEZA = "limpeza"

class ClientForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_session_id: str
    nome_completo: str
    data_nascimento: str
    telefone: str
    nome_pessoa_amada: Optional[str] = None
    situacao_atual: str
    observacoes: Optional[str] = None
    service_type: ServiceType
    video_links: Optional[List[str]] = []
    status: str = "pendente"  # pendente, em_andamento, concluido
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientFormCreate(BaseModel):
    payment_session_id: str
    nome_completo: str
    data_nascimento: str
    telefone: str
    nome_pessoa_amada: Optional[str] = None
    situacao_atual: str
    observacoes: Optional[str] = None
    service_type: ServiceType

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    service_type: ServiceType
    amount: float
    currency: str = "brl"
    payment_status: PaymentStatus
    metadata: Optional[Dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    service_type: ServiceType
    origin_url: str

class AdminLogin(BaseModel):
    password: str

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Mystic Services API"}

@api_router.get("/services")
async def get_services():
    return {"services": SERVICES}

@api_router.post("/checkout/session")
async def create_checkout_session(request: CheckoutRequest):
    try:
        # Validate service exists
        if request.service_type not in SERVICES:
            raise HTTPException(status_code=400, detail="Serviço inválido")
        
        service = SERVICES[request.service_type]
        amount = service["price"]
        
        # Create success and cancel URLs
        success_url = f"{request.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/cancel"
        
        # Initialize Stripe checkout
        webhook_url = f"{request.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="brl",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "service_type": request.service_type,
                "service_name": service["name"]
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            session_id=session.session_id,
            service_type=request.service_type,
            amount=amount,
            payment_status=PaymentStatus.INITIATED,
            metadata=checkout_request.metadata
        )
        
        await db.payment_transactions.insert_one(transaction.dict())
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar sessão de pagamento: {str(e)}")

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    try:
        # Initialize Stripe checkout (webhook_url not needed for status check)
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Get status from Stripe
        status_response = await stripe_checkout.get_checkout_status(session_id)
        
        # Update local transaction record
        update_data = {
            "payment_status": PaymentStatus.COMPLETED if status_response.payment_status == "paid" else PaymentStatus.PENDING,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if status_response.status == "expired":
            update_data["payment_status"] = PaymentStatus.EXPIRED
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        return {
            "status": status_response.status,
            "payment_status": status_response.payment_status,
            "amount_total": status_response.amount_total,
            "currency": status_response.currency,
            "metadata": status_response.metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar status do pagamento: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    try:
        body = await request.body()
        
        # Initialize Stripe checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        if webhook_response.event_type == "checkout.session.completed":
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": PaymentStatus.COMPLETED,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

@api_router.post("/client-form")
async def submit_client_form(form_data: ClientFormCreate):
    try:
        # Verify payment was completed
        transaction = await db.payment_transactions.find_one({"session_id": form_data.payment_session_id})
        if not transaction or transaction["payment_status"] != PaymentStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Pagamento não encontrado ou não confirmado")
        
        # Create client form record
        client_form = ClientForm(**form_data.dict())
        await db.client_forms.insert_one(client_form.dict())
        
        return {"message": "Formulário enviado com sucesso!", "id": client_form.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar formulário: {str(e)}")

# Admin Routes
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    if login_data.password != "admin123":
        raise HTTPException(status_code=401, detail="Senha incorreta")
    return {"message": "Login realizado com sucesso", "token": "admin_authenticated"}

@api_router.get("/admin/clients")
async def get_clients(authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    # Get all client forms with payment info
    clients = await db.client_forms.find().to_list(1000)
    
    # Enrich with payment information
    for client in clients:
        transaction = await db.payment_transactions.find_one({"session_id": client["payment_session_id"]})
        if transaction:
            client["payment_info"] = {
                "amount": transaction["amount"],
                "payment_status": transaction["payment_status"],
                "service_name": SERVICES[transaction["service_type"]]["name"]
            }
    
    return {"clients": clients}

@api_router.get("/admin/transactions")
async def get_transactions(authorization: str = Header(None)):
    if authorization != "Bearer admin_authenticated":
        raise HTTPException(status_code=401, detail="Não autorizado")
    
    transactions = await db.payment_transactions.find().to_list(1000)
    
    # Convert MongoDB ObjectId to string for JSON serialization
    for transaction in transactions:
        if '_id' in transaction:
            transaction['_id'] = str(transaction['_id'])
    
    return {"transactions": transactions}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()