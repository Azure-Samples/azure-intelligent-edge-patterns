DROP TABLE IF EXISTS arrivals
CREATE TABLE arrivals (
	ArrivalTime datetime NOT NULL,
	ArrivalCount int NOT NULL,
	SeriesId nvarchar(10) NOT NULL
)
GO