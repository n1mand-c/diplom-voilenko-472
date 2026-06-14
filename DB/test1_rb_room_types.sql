-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: test1
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `rb_room_types`
--

DROP TABLE IF EXISTS `rb_room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_room_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int DEFAULT '2',
  `extra_price` decimal(10,2) DEFAULT '0.00',
  `total_rooms` int DEFAULT '1',
  `amenities` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `rb_room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `rb_hotels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_room_types`
--

LOCK TABLES `rb_room_types` WRITE;
/*!40000 ALTER TABLE `rb_room_types` DISABLE KEYS */;
INSERT INTO `rb_room_types` VALUES (1,1,'Стандарт',2,0.00,1,NULL),(2,1,'Люкс',2,1500.00,1,NULL),(3,2,'Стандарт',2,0.00,1,NULL),(4,2,'Люкс',3,1200.00,1,NULL),(5,3,'Стандарт',2,0.00,1,NULL),(6,4,'Стандарт',2,0.00,1,NULL),(7,4,'Люкс',2,5000.00,1,NULL),(8,5,'Стандарт ',2,0.00,1,NULL),(9,3,'Стандарт (до 4 місць)',4,2700.00,5,NULL),(10,7,'Стандарт ',2,0.00,10,NULL),(11,7,'Стандарт ',4,4000.00,10,'[\"WiFi\", \"Кондиціонер\", \"Басейн\", \"Телевізор\", \"Спа\", \"Парковка\"]'),(12,7,'Люкс',2,7500.00,5,'[\"WiFi\", \"Кондиціонер\", \"Басейн\", \"Телевізор\", \"Спа\", \"Парковка\", \"Сніданок\", \"Тренажерний зал\"]'),(13,6,'Стандарт',2,0.00,8,'[]'),(14,6,'Люкс',4,3000.00,4,'[\"Додатково джакузі\", \"Збільшений мінібар\", \"WiFi\", \"Басейн\", \"Спа\", \"Ресторан\", \"Бар\", \"Кондиціонер\", \"Парковка\", \"Телевізор\", \"Сніданок\", \"Тренажерний зал\", \"Трансфер\"]');
/*!40000 ALTER TABLE `rb_room_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 18:17:33
