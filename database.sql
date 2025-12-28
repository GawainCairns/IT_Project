CREATE DATABASE IF NOT EXISTS SurveyApp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE SurveyApp;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone_number` VARCHAR(20),
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin','user') NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `surveys` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `created_by` INT UNSIGNED,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_surveys_created_by` (`created_by`),
    CONSTRAINT `fk_surveys_users` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_options` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `survey_id` INT UNSIGNED NOT NULL,
    `option_text` VARCHAR(255) NOT NULL,
    `votes` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `idx_survey_options_survey` (`survey_id`),
    CONSTRAINT `fk_survey_options_surveys` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `survey_id` INT UNSIGNED NOT NULL,
    `question_text` TEXT NOT NULL,
    `question_type` ENUM('text','textarea','single_choice','multiple_choice') NOT NULL DEFAULT 'text',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_questions_survey` (`survey_id`),
    CONSTRAINT `fk_questions_surveys` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `answers` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `question_id` INT UNSIGNED NOT NULL,
    `answer_text` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_answers_question` (`question_id`),
    CONSTRAINT `fk_answers_questions` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `responses` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `survey_id` INT UNSIGNED NOT NULL,
    `question_id` INT UNSIGNED,
    `user_id` INT UNSIGNED,
    `response_text` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_responses_survey` (`survey_id`),
    KEY `idx_responses_question` (`question_id`),
    KEY `idx_responses_user` (`user_id`),
    CONSTRAINT `fk_responses_surveys` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_responses_questions` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_responses_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes:
-- `users` stores authentication and role info. Passwords should be stored as hashes in `password_hash`.
-- `surveys` may optionally reference a `created_by` user.
-- `survey_options` is intended for choice-style surveys; `questions` covers per-survey questions and types.
-- `answers` can be used to store predefined answer options for questions when needed.
-- `responses` stores actual user responses; `question_id` and `user_id` are nullable to allow anonymous responses or survey-level responses.