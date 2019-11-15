/*
	INSERT NEW TRANSACTION INFORMATION
*/
CREATE PROCEDURE uspCreateNewTransaction
	@item_id int,
	@item_qty int,
	@customer_face_hash nvarchar(50)
AS

DECLARE @time_zone nvarchar(50) = 'Pacific Standard Time';
DECLARE @transaction_time datetime = (getdate() at time zone 'UTC') at time zone @time_zone;

INSERT INTO transactions
VALUES(@transaction_time, @item_id, @item_qty, @customer_face_hash)
GO

-- exec uspCreateNewTransaction '2019-10-10T08:52:00Z', 7777, 1, 'wwww-xxxx-yyyy-zzzz'