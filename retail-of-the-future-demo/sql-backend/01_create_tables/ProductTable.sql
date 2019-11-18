DROP TABLE IF EXISTS products

CREATE TABLE products (
	ItemID INT NOT NULL IDENTITY(1111,1111) PRIMARY KEY,
	ItemName nvarchar(30) NOT NULL,
	ItemDescription nvarchar(max) NOT NULL,
	ProductHierarchyName nvarchar(50) NOT NULL
)