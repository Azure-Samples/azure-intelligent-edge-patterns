DROP TABLE IF EXISTS customers
CREATE TABLE customers (
	CustomerFaceHash nvarchar(50) NOT NULL,
	CustomerName nvarchar(50) NOT NULL,
	RegistrationDate datetime NOT NULL
)
GO