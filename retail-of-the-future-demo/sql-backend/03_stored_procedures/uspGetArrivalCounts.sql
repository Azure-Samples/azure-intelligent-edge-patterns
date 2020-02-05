/*
	GET LATEST HOURLY ARRIVAL COUNTS
*/
USE retailexperience;
GO

DROP PROCEDURE IF EXISTS uspGetArrivalCounts;
GO

CREATE PROCEDURE uspGetArrivalCounts
	@seriesId nvarchar(50),
	@lastHours int
AS

DECLARE @cutOffTime DATETIME
SET @cutOffTime = DATEADD(HOUR, -(@lastHours+1), GETUTCDATE())

SELECT TOP (@lastHours)
  CONVERT(DATE, ArrivalTime) AS ArrivalDate,
  DATEPART(HOUR, ArrivalTime) AS ArrivalHour,
  SUM(ArrivalCount) AS Arrivals
FROM arrivals
WHERE SeriesID = @SeriesId AND ArrivalTime > @cutOffTime
GROUP BY CONVERT(DATE, ArrivalTime), DATEPART(HOUR, ArrivalTime)
ORDER BY ArrivalDate DESC, ArrivalHour DESC

GO
