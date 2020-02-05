DECLARE @date DATETIME
SET @date = '2020-01-09T00:00:00Z'
DELETE FROM inventory WHERE BusinessDate = @date
INSERT INTO inventory
VALUES(11110, @date, 100)
INSERT INTO inventory
VALUES(16665, @date, 100)
INSERT INTO inventory
VALUES(17776, @date, 100)
INSERT INTO inventory
VALUES(18887, @date, 100)




