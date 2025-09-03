from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Modelos principales
from .user import User
from .article import Article, Category
from .sale import Sale, SaleItem, Turno, SuspendedSale, Devolucion
from .inventoryLog import InventoryMovement, MovementType
# NO importar app ni db desde app.py - eso causa import circular