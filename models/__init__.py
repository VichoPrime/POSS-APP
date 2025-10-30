from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar solo los modelos existentes
from .user import User
from .article import Article, Category
from .sale import Sale, SaleItem, Turno
from .inventory_loss import InventoryLoss
from .physical_inventory import PhysicalInventory
from .discount import Discount, Promotion, SaleDiscount
from .history import ProductHistory, PhysicalCountHistory
# NO importar app ni db desde app.py - eso causa import circular