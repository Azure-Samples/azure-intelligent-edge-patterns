DROP PROCEDURE IF EXISTS uspGetInventoryStats;
GO

CREATE PROCEDURE uspGetInventoryStats

AS

DECLARE @time_zone varchar(50) = 'Pacific Standard Time';
DECLARE @now datetime = (getdate() at time zone 'UTC') at time zone @time_zone;
DECLARE @today_start datetime = cast(@now as date);
DECLARE @today_end datetime = concat(cast(@now as date), 'T23:59:59Z');
DECLARE @last_hour datetime = dateadd(minute, -60, @now);

with previous_hour_sales as
(
	select
		itemid,
		count(*) as LastHrQtySold
	from
	(select * from transactions where TransactionTime between @last_hour and @now) prv_hr
	group by itemid
)
, today_sales as
(
	select 
		itemid,
		count(*) as TodayQtySold
	from
	(select * from transactions	where TransactionTime between @today_start and @now) tdy
	group by itemid
)
select 
	i.*, 
	ProductHierarchyName,
	CASE WHEN LastHrQtySold IS NULL THEN 0 ELSE LastHrQtySold END AS LastHrQtySold,
	CASE WHEN TodayQtySold IS NULL THEN 0 ELSE TodayQtySold END AS TodayQtySold, 
	CASE WHEN TodayQtySold IS NULL THEN StartingInventory ELSE StartingInventory - TodayQtySold END AS RemainingInventory
from inventory i
left join products p
	on i.ItemId = p.ItemId
left join previous_hour_sales prh
	on i.itemid = prh.itemid
left join today_sales as ts
	on i.itemid = ts.itemid
where BusinessDate = @today_start
GO

-- exec uspGetInventoryStats