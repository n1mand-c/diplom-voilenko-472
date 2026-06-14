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
-- Table structure for table `rb_hotels`
--

DROP TABLE IF EXISTS `rb_hotels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rb_hotels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sport` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sport_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stars` int DEFAULT '4',
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `rating` decimal(3,1) DEFAULT '0.0',
  `reviews` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `sports` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rb_hotels`
--

LOCK TABLES `rb_hotels` WRITE;
/*!40000 ALTER TABLE `rb_hotels` DISABLE KEYS */;
INSERT INTO `rb_hotels` VALUES (1,'Alpine Extreme Resort','Шамоні, Франція','ski','Лижі / Фрірайд',5,4200.00,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop','Преміальний гірськолижний курорт у серці Монблану.',4.9,312,'2026-03-19 11:04:23',NULL,NULL,'[\"ski\"]'),(2,'Powder Palace Hotel','Зельден, Австрія','ski','Сноубординг',5,3800.00,'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop','Снобордичний рай з доступом до найкращих парків та свіжого пухляку.',4.8,247,'2026-03-19 11:04:23',NULL,NULL,'[\"ski\"]'),(3,'Red Bull Base Camp','Іннсбрук, Австрія','ski','Лижі / Фрірайд',4,3100.00,'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&auto=format&fit=crop','Офіційний партнер Red Bull. Готель де зупиняються спортивні зірки.',4.9,521,'2026-03-19 11:04:23',NULL,NULL,'[\"ski\"]'),(4,'Summit Climbers Lodge','Доломіти, Італія','climbing','Лазаня',4,2800.00,'https://cf.bstatic.com/xdata/images/hotel/max1024x768/585976092.jpg?k=c94847ea9a65ea0a68c963478b1f704c7e7dc2faa0f9b525dd7e84c98d8d6d2f&o=','Спеціалізований готель для альпіністів з власним скеледромом.',4.7,189,'2026-03-19 11:04:23',NULL,NULL,'[\"climbing\"]'),(5,'Top Apart Gaislachkogl','Зельден, Австрия ','ski','Сноубординг',4,3700.00,'https://cf.bstatic.com/xdata/images/hotel/max1024x768/410406102.jpg?k=d1efbb67613b2636511e33c84870131fb90a36ae49438aaca6697ba14c8846cb&o=','123',4.5,2,'2026-03-19 12:02:45',NULL,NULL,'[\"ski\"]'),(6,'Hotel Boka Bovec','Бовец, Словенія  ','rafting','Рафтинг',4,4000.00,'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/8e/5e/45/boka-hotel-and-waterfall.jpg?w=900&h=500&s=1','123',4.0,1,'2026-03-28 14:36:43','[\"WiFi\", \"Басейн\", \"Спа\", \"Ресторан\", \"Бар\", \"Парковка\"]','[\"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/8e/5e/45/boka-hotel-and-waterfall.jpg?w=900&h=500&s=1\"]','[\"rafting\"]'),(7,'Anantara Dhigu Maldives Resort ','Південний Мале (Kaafu)','surfing','Серфінг',5,5500.00,'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/21/a2/3f/ff/anantara-dhigu-maldives.jpg?w=1000&h=-1&s=1','Anantara Dhigu Maldives Resort — відомий готель, де є все для безтурботного відпочинку в острівному стилі. Курорт пройшов повну реконструкцію у 2019–2021 роках і став ще прекраснішим, ніж раніше.',4.6,5,'2026-03-29 15:51:40','[\"WiFi\", \"Басейн\", \"Спа\", \"Бар\", \"Кондиціонер\", \"Джакузі\", \"Тренажерний зал\", \"Ресторан\"]','[\"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/bd/86/36/overwater-suite.jpg?w=1000&h=-1&s=1\", \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/f0/39/05/caption.jpg?w=1000&h=-1&s=1\", \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/6d/52/87/caption.jpg?w=1000&h=-1&s=1\", \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/f0/3a/ae/caption.jpg?w=1000&h=-1&s=1\", \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/0f/da/8a/caption.jpg?w=1000&h=-1&s=1\", \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/89/b0/cd/caption.jpg?w=1000&h=-1&s=1\"]','[\"surfing\"]');
/*!40000 ALTER TABLE `rb_hotels` ENABLE KEYS */;
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
