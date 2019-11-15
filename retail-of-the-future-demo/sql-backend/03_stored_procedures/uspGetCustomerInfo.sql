/*
	GET LATEST CUSTOMER TRANSACTION INFO
*/
USE retailexperience;
GO

ALTER PROCEDURE uspGetCustomerInfo
	@customer_id nvarchar(50)
AS

with max_purchase_date as (
	select 
		t.CustomerFaceHash,
		c.CustomerName,
		max(TransactionTime) as max_purchase_date
	from transactions t
	left join customers c
	on t.CustomerFaceHash = c.CustomerFaceHash
	where t.CustomerFaceHash = @customer_id
	group by t.CustomerFaceHash, c.CustomerName
)

, latest_puchase_details as (
	select 
		mpd.CustomerFaceHash,
		mpd.CustomerName,
		TransactionTime as PreviousVisitDate,
		ItemID as SourceItemID
	from transactions t
	inner join max_purchase_date mpd
	on t.CustomerFaceHash = mpd.CustomerFaceHash
	and t.TransactionTime = mpd.max_purchase_date
)

, results as(
	select 
		lpd.*, 
		recs.SourceItemDesc as SourceItemDesc,
		recs.DestItemID as RecommendedItemID,
		recs.DestItemDesc as RecommendedItemDesc

	from latest_puchase_details lpd 

	left join (
		select 
			r.*,
			p1.ItemDescription as SourceItemDesc,
			p2.ItemDescription as DestItemDesc
		from recommendations r
		left join products p1
			on r.SourceItemId = p1.ItemID
		left join products p2
			on r.DestItemID = p2.ItemID
	) as recs
	on lpd.SourceItemId = recs.SourceItemId
)
select * from results;

GO


-- exec uspGetCustomerInfo 'aaaa-bbbb-cccc-dddd'
-- exec uspGetCustomerInfo 'wwww-xxxx-yyyy-zzzz
