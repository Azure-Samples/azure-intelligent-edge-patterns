/*
	INSERT NEW CUSTOMER RECORD
*/

ALTER PROCEDURE uspCreateCustomerRecord
	@customer_face_hash nvarchar(50),
	@customer_name nvarchar(50)
AS

DECLARE @time_zone nvarchar(50) = 'Pacific Standard Time';
DECLARE @register_date datetime = (getdate() at time zone 'UTC') at time zone @time_zone;

INSERT into customers 
VALUES(@customer_face_hash, @customer_name, @register_date)
GO

-- exec uspCreateCustomerRecord 'aaaa-bbbb-cccc-dddd', 'edwin'
-- exec uspCreateCustomerRecord 'wwww-xxxx-yyyy-zzzz', 'jota'
