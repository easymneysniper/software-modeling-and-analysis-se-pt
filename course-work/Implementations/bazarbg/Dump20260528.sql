CREATE DATABASE  IF NOT EXISTS `bazar_platform` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bazar_platform`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bazar_platform
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Table structure for table `ad_images`
--

DROP TABLE IF EXISTS `ad_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ad_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ad_id` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `is_main` tinyint(1) NOT NULL DEFAULT '0',
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ad_images_ad` (`ad_id`),
  CONSTRAINT `fk_ad_images_ad` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ad_images`
--

LOCK TABLES `ad_images` WRITE;
/*!40000 ALTER TABLE `ad_images` DISABLE KEYS */;
INSERT INTO `ad_images` VALUES (1,19,'/static/uploads/ads/f23da603bb71433381eca164fb73b59c.jpg',0,1,'2026-05-28 12:35:58'),(2,20,'/static/uploads/ads/d6d1d5a5f07248ad983e91d420d0bf09.jpg',0,1,'2026-05-28 12:44:34');
/*!40000 ALTER TABLE `ad_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ads`
--

DROP TABLE IF EXISTS `ads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `location_id` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BGN',
  `is_negotiable` tinyint(1) NOT NULL DEFAULT '0',
  `item_condition` enum('new','used','for_parts','not_specified') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_specified',
  `address_area` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_visible` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('pending','active','sold','expired','rejected','deleted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `views_count` int NOT NULL DEFAULT '0',
  `published_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ads_user` (`user_id`),
  KEY `fk_ads_category` (`category_id`),
  KEY `fk_ads_location` (`location_id`),
  CONSTRAINT `fk_ads_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ads_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ads`
--

LOCK TABLES `ads` WRITE;
/*!40000 ALTER TABLE `ads` DISABLE KEYS */;
INSERT INTO `ads` VALUES (1,1,11,1,'BMW 320d E91 2007 163 к.с.','Продавам BMW 320d E91, 2007 година, 163 коня. Колата е обслужена, с нормални следи от употреба.',8500.00,'BGN',1,'used','Люлин',1,'active',249,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 14:48:00'),(2,1,12,1,'Комплект предни дискове и накладки за BMW E90/E91','Запазени дискове и накладки, свалени от BMW E91. Подходящи за 320d.',180.00,'BGN',1,'used','Младост',1,'active',78,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(3,2,14,2,'Двустаен апартамент под наем в Пловдив','Двустаен апартамент в Кършияка, напълно обзаведен, близо до спирки и магазини.',750.00,'BGN',0,'not_specified','Кършияка',1,'active',390,'2026-05-28 11:48:10','2026-07-12 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(4,2,13,2,'Ъглов диван с функция сън','Продавам голям ъглов диван в добро състояние. Има функция сън и ракла.',420.00,'BGN',1,'used','Тракия',1,'active',136,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 12:11:50'),(5,3,17,3,'iPhone 13 128GB Midnight','Телефонът е в отлично състояние, без забележки. Батерия 89%. Оригинална кутия.',850.00,'BGN',1,'used','Център',1,'active',512,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(6,3,18,3,'Lenovo ThinkPad T480 i5 16GB RAM SSD','Бизнес лаптоп Lenovo ThinkPad T480, i5 процесор, 16GB RAM, 512GB SSD.',620.00,'BGN',1,'used','Левски',1,'active',280,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(7,4,29,4,'Планински велосипед Drag 29 цола','Велосипедът е използван малко, 29 цола, алуминиева рамка, дискови спирачки.',680.00,'BGN',1,'used','Славейков',1,'active',189,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(8,5,20,5,'Дамско зимно яке Zara','Дамско яке Zara, размер M, носено един сезон, без скъсано или петна.',90.00,'BGN',0,'used','Център',1,'active',75,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(9,5,22,5,'Дамски кожени боти','Елегантни дамски боти от естествена кожа, размер 38.',120.00,'BGN',1,'used','Казански',1,'active',66,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 13:35:52'),(10,7,24,6,'Комплект инструменти Bosch','Продавам комплект инструменти Bosch, подходящи за домашен ремонт и професионална употреба.',350.00,'BGN',1,'used','Дружба',1,'active',156,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(11,8,26,7,'Детска количка 3 в 1','Детска количка 3 в 1, запазена, с кош за новородено и столче за кола.',480.00,'BGN',1,'used','Ново село',1,'active',210,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(12,8,27,7,'Комплект детски играчки','Голям комплект детски играчки за момче, подходящи за възраст 3-6 години.',60.00,'BGN',0,'used','Център',1,'active',92,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(13,9,28,8,'Лежанка за фитнес','Регулируема лежанка за домашен фитнес, стабилна конструкция.',220.00,'BGN',1,'used','Сторгозия',1,'active',112,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(14,10,30,9,'Колекция книги на Стивън Кинг','Продавам колекция от 8 книги на Стивън Кинг, много запазени.',95.00,'BGN',1,'used','Широк център',1,'active',88,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(15,4,31,4,'Малки кученца търсят дом','Подаряват се малки кученца, обезпаразитени и много игриви.',0.00,'BGN',0,'not_specified','Меден рудник',1,'active',430,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(16,6,33,1,'Junior Frontend Developer','Фирма в София търси junior frontend developer с React. Подходящо за начинаещи.',1800.00,'BGN',0,'not_specified','Бизнес парк',0,'active',312,'2026-05-28 11:48:10','2026-07-27 11:48:10','2026-05-28 11:48:10','2026-05-28 15:17:26'),(17,6,35,1,'Ремонт на баня и кухня','Предлагаме ремонтни услуги, шпакловка, боядисване, плочки, ВиК и довършителни работи.',50.00,'BGN',1,'not_specified','Цяла София',1,'active',198,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(18,7,36,6,'Транспорт с бус до 1.5 тона','Извършвам транспортни услуги с бус в Русе и страната. Коректни цени.',80.00,'BGN',1,'not_specified','Център',1,'active',146,'2026-05-28 11:48:10','2026-06-27 11:48:10','2026-05-28 11:48:10','2026-05-28 11:48:10'),(19,11,11,1,'BMW 320d E91 163hp','Отлично състояние, добре поддържан автомобил, 163кс, 2007г. Гражданска, каско, винетка платени.',7600.00,'BGN',1,'used','Сухата река',1,'active',32,'2026-05-28 12:27:53','2026-06-27 12:27:53','2026-05-28 12:27:52','2026-05-28 15:11:28'),(20,11,17,1,'iPhone 14 Pro 128GB Midnight','Чисто нов, в кутията. Беше за подарък ама не ми се подарява вече.',1300.00,'BGN',0,'new','Банишора',1,'active',28,'2026-05-28 12:44:35','2026-06-27 12:44:35','2026-05-28 12:44:34','2026-05-28 12:56:14');
/*!40000 ALTER TABLE `ads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blacklists`
--

DROP TABLE IF EXISTS `blacklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `blocker_user_id` int NOT NULL,
  `blocked_user_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blacklist_pair` (`blocker_user_id`,`blocked_user_id`),
  KEY `fk_blacklists_blocked` (`blocked_user_id`),
  CONSTRAINT `fk_blacklists_blocked` FOREIGN KEY (`blocked_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_blacklists_blocker` FOREIGN KEY (`blocker_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklists`
--

LOCK TABLES `blacklists` WRITE;
/*!40000 ALTER TABLE `blacklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `blacklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int DEFAULT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Авто','auto',NULL,'car',1,1),(2,'Имоти','imoti',NULL,'home',2,1),(3,'Електроника','elektronika',NULL,'laptop',3,1),(4,'Мода','moda',NULL,'shirt',4,1),(5,'Дом и градина','dom-i-gradina',NULL,'garden',5,1),(6,'Детски и бебешки','detski-i-bebeshki',NULL,'baby',6,1),(7,'Спорт и хоби','sport-i-hobi',NULL,'sport',7,1),(8,'Животни','jivotni',NULL,'paw',8,1),(9,'Работа','rabota',NULL,'briefcase',9,1),(10,'Услуги','uslugi',NULL,'tools',10,1),(11,'Автомобили и джипове','avtomobili-i-djipove',1,'car',1,1),(12,'Авточасти','avtochasti',1,'settings',2,1),(13,'Гуми и джанти','gumi-i-djanti',1,'circle',3,1),(14,'Апартаменти','apartamenti',2,'building',1,1),(15,'Къщи и вили','kashti-i-vili',2,'home',2,1),(16,'Гаражи','garaji',2,'garage',3,1),(17,'Телефони','telefoni',3,'phone',1,1),(18,'Лаптопи','laptopi',3,'laptop',2,1),(19,'Компютърни компоненти','kompyutarni-komponenti',3,'cpu',3,1),(20,'Дамска мода','damska-moda',4,'dress',1,1),(21,'Мъжка мода','majka-moda',4,'shirt',2,1),(22,'Обувки','obuvki',4,'shoe',3,1),(23,'Мебели','mebeli',5,'sofa',1,1),(24,'Инструменти','instrumenti',5,'hammer',2,1),(25,'Градинска техника','gradinska-tehnika',5,'leaf',3,1),(26,'Детски колички','detski-kolichki',6,'baby-carriage',1,1),(27,'Играчки','igrachki',6,'toy',2,1),(28,'Фитнес уреди','fitnes-uredi',7,'dumbbell',1,1),(29,'Велосипеди','velosipedi',7,'bike',2,1),(30,'Книги','knigi',7,'book',3,1),(31,'Кучета','kucheta',8,'dog',1,1),(32,'Котки','kotki',8,'cat',2,1),(33,'ИТ работа','it-rabota',9,'code',1,1),(34,'Търговия','targovia',9,'shop',2,1),(35,'Ремонтни услуги','remontni-uslugi',10,'toolbox',1,1),(36,'Транспортни услуги','transportni-uslugi',10,'truck',2,1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite_ads`
--

DROP TABLE IF EXISTS `favorite_ads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite_ads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `ad_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorite_user_ad` (`user_id`,`ad_id`),
  KEY `fk_favorite_ads_ad` (`ad_id`),
  CONSTRAINT `fk_favorite_ads_ad` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_ads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite_ads`
--

LOCK TABLES `favorite_ads` WRITE;
/*!40000 ALTER TABLE `favorite_ads` DISABLE KEYS */;
INSERT INTO `favorite_ads` VALUES (1,2,1,'2026-05-28 11:48:10'),(2,3,1,'2026-05-28 11:48:10'),(3,4,5,'2026-05-28 11:48:10'),(4,5,6,'2026-05-28 11:48:10'),(5,1,7,'2026-05-28 11:48:10'),(6,8,3,'2026-05-28 11:48:10'),(7,9,10,'2026-05-28 11:48:10'),(8,10,5,'2026-05-28 11:48:10'),(9,6,14,'2026-05-28 11:48:10'),(10,7,13,'2026-05-28 11:48:10'),(11,1,16,'2026-05-28 11:48:10'),(12,2,17,'2026-05-28 11:48:10');
/*!40000 ALTER TABLE `favorite_ads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bulgaria',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'София','София-град','Bulgaria'),(2,'Пловдив','Пловдив','Bulgaria'),(3,'Варна','Варна','Bulgaria'),(4,'Бургас','Бургас','Bulgaria'),(5,'Стара Загора','Стара Загора','Bulgaria'),(6,'Русе','Русе','Bulgaria'),(7,'Сливен','Сливен','Bulgaria'),(8,'Плевен','Плевен','Bulgaria'),(9,'Благоевград','Благоевград','Bulgaria'),(10,'Велико Търново','Велико Търново','Bulgaria');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `ad_id` int DEFAULT NULL,
  `message_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_messages_sender` (`sender_id`),
  KEY `fk_messages_receiver` (`receiver_id`),
  KEY `fk_messages_ad` (`ad_id`),
  CONSTRAINT `fk_messages_ad` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,2,1,1,'Здравейте, BMW-то още ли е налично?',1,'2026-05-28 11:48:10'),(2,1,2,1,'Здравейте, да, налично е. Може да се види в София.',1,'2026-05-28 11:48:10'),(3,3,1,1,'Има ли обслужена верига?',0,'2026-05-28 11:48:10'),(4,1,3,5,'Здравейте, телефонът има ли гаранция?',1,'2026-05-28 11:48:10'),(5,3,1,5,'Здравейте, гаранцията е изтекла, но телефонът е перфектен.',1,'2026-05-28 11:48:10'),(6,8,2,3,'Здравейте, апартаментът свободен ли е от следващия месец?',0,'2026-05-28 11:48:10'),(7,9,7,10,'Комплектът инструменти пълен ли е?',1,'2026-05-28 11:48:10'),(8,7,9,10,'Да, всичко от снимките е налично.',1,'2026-05-28 11:48:10'),(9,10,3,6,'Лаптопът има ли забележки по екрана?',0,'2026-05-28 11:48:10'),(10,5,8,11,'Количката има ли зимен кош?',1,'2026-05-28 11:48:10'),(11,8,5,11,'Да, има зимен кош и столче за кола.',1,'2026-05-28 11:48:10'),(12,12,11,20,'Здрасти, искам го.',1,'2026-05-28 12:51:51'),(13,11,12,NULL,'Здрасти, добре, къде да го изпратя.',1,'2026-05-28 12:57:11'),(14,11,1,1,'Здрасти, коментар по цената възможен ли е?',0,'2026-05-28 14:48:15'),(15,11,1,NULL,'Плийс',0,'2026-05-28 15:17:03');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ad_id` int NOT NULL,
  `promotion_type` enum('top','vip','highlighted','urgent') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_promotions_ad` (`ad_id`),
  CONSTRAINT `fk_promotions_ad` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,1,'top','2026-05-28 11:48:10','2026-06-04 11:48:10',14.99,'paid','2026-05-28 11:48:10'),(2,5,'vip','2026-05-28 11:48:10','2026-06-11 11:48:10',24.99,'paid','2026-05-28 11:48:10'),(3,6,'highlighted','2026-05-28 11:48:10','2026-06-04 11:48:10',9.99,'paid','2026-05-28 11:48:10'),(4,16,'top','2026-05-28 11:48:10','2026-06-07 11:48:10',19.99,'paid','2026-05-28 11:48:10'),(5,17,'urgent','2026-05-28 11:48:10','2026-05-31 11:48:10',5.99,'pending','2026-05-28 11:48:10');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reporter_id` int NOT NULL,
  `ad_id` int NOT NULL,
  `reason` enum('fraud','wrong_category','forbidden_item','duplicate','spam','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','reviewed','resolved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reports_reporter` (`reporter_id`),
  KEY `fk_reports_ad` (`ad_id`),
  KEY `fk_reports_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_reports_ad` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,3,15,'other','Обявата е за подаряване, но искам проверка дали е реална.','pending',NULL,'2026-05-28 11:48:10',NULL),(2,2,1,'duplicate','Видях подобна обява от същия продавач.','reviewed',6,'2026-05-28 11:48:10','2026-05-28 11:48:10'),(3,5,16,'wrong_category','Обявата може би е по-подходяща за работа, не за услуги.','rejected',6,'2026-05-28 11:48:10','2026-05-28 11:48:10');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_searches`
--

DROP TABLE IF EXISTS `saved_searches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_searches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keyword` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `min_price` decimal(10,2) DEFAULT NULL,
  `max_price` decimal(10,2) DEFAULT NULL,
  `filters_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_saved_searches_user` (`user_id`),
  KEY `fk_saved_searches_category` (`category_id`),
  KEY `fk_saved_searches_location` (`location_id`),
  CONSTRAINT `fk_saved_searches_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_saved_searches_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_saved_searches_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_searches`
--

LOCK TABLES `saved_searches` WRITE;
/*!40000 ALTER TABLE `saved_searches` DISABLE KEYS */;
INSERT INTO `saved_searches` VALUES (1,1,'Лаптопи до 700 лв','thinkpad laptop',18,1,300.00,700.00,'{\"condition\": \"used\"}','2026-05-28 11:48:10'),(2,2,'Апартаменти Пловдив','двустаен апартамент',14,2,500.00,900.00,'{\"rooms\": 2}','2026-05-28 11:48:10'),(3,3,'iPhone 13','iphone 13',17,NULL,600.00,1000.00,'{\"storage\": \"128GB\"}','2026-05-28 11:48:10'),(4,4,'Велосипеди 29','велосипед 29',29,NULL,300.00,900.00,'{\"wheel_size\": \"29\"}','2026-05-28 11:48:10'),(5,5,'Дамски обувки','боти',22,5,50.00,200.00,'{\"size\": 38}','2026-05-28 11:48:10'),(6,8,'Детски колички','количка 3 в 1',26,NULL,200.00,600.00,'{\"type\": \"3 in 1\"}','2026-05-28 11:48:10');
/*!40000 ALTER TABLE `saved_searches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0',
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive','blocked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_location` (`location_id`),
  CONSTRAINT `fk_users_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ivan_auto','ivan.auto@example.com','hashed_password_123','0888123456','Иван','Петров',NULL,1,1,1,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(2,'maria_home','maria.home@example.com','hashed_password_123','0888234567','Мария','Георгиева',NULL,2,1,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(3,'tech_shop','tech.shop@example.com','hashed_password_123','0888345678','Георги','Иванов',NULL,3,1,1,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(4,'petar_bikes','petar.bikes@example.com','hashed_password_123','0888456789','Петър','Димитров',NULL,4,0,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(5,'elena_fashion','elena.fashion@example.com','hashed_password_123','0888567890','Елена','Стоянова',NULL,5,1,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(6,'admin_user','admin@example.com','hashed_admin_password','0888678901','Admin','User',NULL,1,1,1,1,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(7,'nikolay_tools','nikolay.tools@example.com','hashed_password_123','0888789012','Николай','Колев',NULL,6,1,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(8,'desi_kids','desi.kids@example.com','hashed_password_123','0888890123','Десислава','Ангелова',NULL,7,0,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(9,'martin_sport','martin.sport@example.com','hashed_password_123','0888901234','Мартин','Христов',NULL,8,1,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(10,'ani_books','ani.books@example.com','hashed_password_123','0888012345','Анелия','Николова',NULL,9,1,0,0,'active','2026-05-28 11:48:10','2026-05-28 11:48:10'),(11,'m.stanoichev','m.stanoichev@abv.bg','$2b$12$ny4ZBJFSDTczXZbC96q3Y.oMzuc/GhHOiLSalvlG7UzV0Kt1pZzgq','0871234567','Mario','Stanoychev',NULL,1,0,0,1,'active','2026-05-28 12:12:28','2026-05-28 12:12:28'),(12,'i.petrov','i.petrov@abv.bg','$2b$12$rXVzC9oM8zPAFY3c6X.RvO1imkWWS6XMZA721ZzoUeINMea/Nd4t.','0871234765','Ivaylo','Petrov',NULL,1,0,0,0,'active','2026-05-28 12:46:14','2026-05-28 12:46:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Stored functions, procedures and triggers
--

DROP FUNCTION IF EXISTS `fn_ad_favorites_count`;
DROP FUNCTION IF EXISTS `fn_user_active_ads_count`;
DROP PROCEDURE IF EXISTS `sp_get_user_marketplace_stats`;
DROP PROCEDURE IF EXISTS `sp_mark_ad_as_sold`;
DROP TRIGGER IF EXISTS `trg_ads_before_insert_defaults`;
DROP TRIGGER IF EXISTS `trg_messages_before_insert_validate`;

DELIMITER ;;

CREATE FUNCTION `fn_ad_favorites_count`(p_ad_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO v_count
    FROM favorite_ads
    WHERE ad_id = p_ad_id;

    RETURN v_count;
END ;;

CREATE FUNCTION `fn_user_active_ads_count`(p_user_id INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_count INT DEFAULT 0;

    SELECT COUNT(*)
    INTO v_count
    FROM ads
    WHERE user_id = p_user_id
      AND status = 'active';

    RETURN v_count;
END ;;

CREATE PROCEDURE `sp_get_user_marketplace_stats`(IN p_user_id INT)
BEGIN
    SELECT
        u.id AS user_id,
        u.username,
        COUNT(DISTINCT a.id) AS total_ads,
        SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) AS active_ads,
        COALESCE(SUM(a.views_count), 0) AS total_views,
        (SELECT COUNT(*) FROM favorite_ads fa WHERE fa.user_id = p_user_id) AS favorite_ads_count,
        (SELECT COUNT(*) FROM messages m WHERE m.sender_id = p_user_id) AS messages_sent,
        (SELECT COUNT(*) FROM messages m WHERE m.receiver_id = p_user_id) AS messages_received,
        (SELECT COUNT(*) FROM reports r WHERE r.reporter_id = p_user_id) AS reports_submitted
    FROM users u
    LEFT JOIN ads a ON a.user_id = u.id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.username;
END ;;

CREATE PROCEDURE `sp_mark_ad_as_sold`(IN p_ad_id INT, IN p_user_id INT)
BEGIN
    UPDATE ads
    SET status = 'sold',
        updated_at = NOW()
    WHERE id = p_ad_id
      AND user_id = p_user_id
      AND status <> 'deleted';

    SELECT ROW_COUNT() AS affected_rows;
END ;;

CREATE TRIGGER `trg_ads_before_insert_defaults`
BEFORE INSERT ON `ads`
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' AND NEW.published_at IS NULL THEN
        SET NEW.published_at = NOW();
    END IF;

    IF NEW.expires_at IS NULL THEN
        SET NEW.expires_at = DATE_ADD(COALESCE(NEW.published_at, NOW()), INTERVAL 30 DAY);
    END IF;
END ;;

CREATE TRIGGER `trg_messages_before_insert_validate`
BEFORE INSERT ON `messages`
FOR EACH ROW
BEGIN
    IF NEW.sender_id = NEW.receiver_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sender and receiver cannot be the same user.';
    END IF;

    IF NEW.message_text IS NULL OR TRIM(NEW.message_text) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Message text cannot be empty.';
    END IF;
END ;;

DELIMITER ;

--
-- Dumping events for database 'bazar_platform'
--

--
-- Dumping routines for database 'bazar_platform'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 15:40:17
