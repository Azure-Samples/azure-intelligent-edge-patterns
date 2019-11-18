DROP TABLE IF EXISTS inventory
CREATE TABLE inventory (
	ItemID int NOT NULL,
	BusinessDate date NOT NULL,
	StartingInventory int NOT NULL
)