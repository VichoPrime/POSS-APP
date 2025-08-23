from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar solo los modelos existentes
from .user import User
from .article import Article, Category
from .sale import Sale, SaleItem, Turno
# NO importar app ni db desde app.py - eso causa import circular