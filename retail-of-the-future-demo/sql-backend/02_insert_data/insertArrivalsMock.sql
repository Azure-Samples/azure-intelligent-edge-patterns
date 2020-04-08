-- Arrivals table uses UTC time
DECLARE @date DATETIME
SET @date = DATEADD(HOUR, -8, GETDATE())  

DECLARE @seriesId NVARCHAR(10)
SET @seriesId = 'mock'

DELETE FROM arrivals WHERE SeriesId = @seriesId  

DECLARE @It INT
SET @It = 1
WHILE @It <= 8*120  
BEGIN
    SET @date = DATEADD(ss, 30, @date)

	INSERT INTO arrivals
	VALUES(@date, 3*RAND(), @seriesId)

	SET @It = @It + 1
END



