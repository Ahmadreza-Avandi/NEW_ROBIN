-- Create feedback_forms table
CREATE TABLE IF NOT EXISTS feedback_forms (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('sales', 'product') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Create feedback_form_questions table
CREATE TABLE IF NOT EXISTS feedback_form_questions (
  id VARCHAR(36) PRIMARY KEY,
  form_id VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  type ENUM('text', 'rating', 'choice', 'textarea') NOT NULL,
  options JSON,
  required BOOLEAN DEFAULT TRUE,
  question_order INT NOT NULL,
  FOREIGN KEY (form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE
);

-- Create feedback_form_submissions table
CREATE TABLE IF NOT EXISTS feedback_form_submissions (
  id VARCHAR(36) PRIMARY KEY,
  form_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  token VARCHAR(100) NOT NULL,
  FOREIGN KEY (form_id) REFERENCES feedback_forms(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create feedback_form_responses table
CREATE TABLE IF NOT EXISTS feedback_form_responses (
  id VARCHAR(36) PRIMARY KEY,
  submission_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES feedback_form_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES feedback_form_questions(id)
);

-- Create index for faster lookups
CREATE INDEX idx_feedback_form_submissions_token ON feedback_form_submissions(token);
CREATE INDEX idx_feedback_form_submissions_customer ON feedback_form_submissions(customer_id);
CREATE INDEX idx_feedback_form_questions_form ON feedback_form_questions(form_id);
CREATE INDEX idx_feedback_form_responses_submission ON feedback_form_responses(submission_id);

-- Insert default feedback forms
INSERT INTO feedback_forms (id, type, title, description, template, status)
VALUES
(UUID(), 'sales', 'فرم بازخورد تیم فروش', 'لطفا نظر خود را درباره عملکرد تیم فروش به ما اعلام کنید',
'<div class="feedback-form" dir="rtl">
  <h2 class="text-2xl font-bold mb-4">فرم بازخورد تیم فروش</h2>
  <p class="mb-6">مشتری گرامی، نظر شما درباره عملکرد تیم فروش ما برای ما بسیار ارزشمند است. لطفا با تکمیل این فرم، ما را در بهبود خدمات یاری کنید.</p>
  <form id="salesFeedbackForm">
    <!-- Questions will be inserted here dynamically -->
    <div class="form-actions mt-8">
      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">ارسال بازخورد</button>
    </div>
  </form>
</div>', 'active'),

(UUID(), 'product', 'فرم بازخورد محصول', 'لطفا نظر خود را درباره کیفیت و عملکرد محصول به ما اعلام کنید',
'<div class="feedback-form" dir="rtl">
  <h2 class="text-2xl font-bold mb-4">فرم بازخورد محصول</h2>
  <p class="mb-6">مشتری گرامی، نظر شما درباره محصول ما برای ما بسیار ارزشمند است. لطفا با تکمیل این فرم، ما را در بهبود محصولات یاری کنید.</p>
  <form id="productFeedbackForm">
    <!-- Questions will be inserted here dynamically -->
    <div class="form-actions mt-8">
      <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">ارسال بازخورد</button>
    </div>
  </form>
</div>', 'active');

-- Get the IDs of the inserted forms
SET @sales_form_id = (SELECT id FROM feedback_forms WHERE type = 'sales' LIMIT 1);
SET @product_form_id = (SELECT id FROM feedback_forms WHERE type = 'product' LIMIT 1);

-- Insert default questions for sales feedback form
INSERT INTO feedback_form_questions (id, form_id, question, type, options, required, question_order)
VALUES
(UUID(), @sales_form_id, 'میزان رضایت کلی شما از عملکرد تیم فروش ما چقدر است؟', 'rating', '{"min": 1, "max": 5}', TRUE, 1),
(UUID(), @sales_form_id, 'کارشناس فروش تا چه حد به نیازهای شما توجه کرد؟', 'rating', '{"min": 1, "max": 5}', TRUE, 2),
(UUID(), @sales_form_id, 'آیا کارشناس فروش اطلاعات کافی درباره محصولات داشت؟', 'choice', '{"options": ["بله، کاملاً", "تا حدودی", "خیر، اطلاعات کافی نداشت"]}', TRUE, 3),
(UUID(), @sales_form_id, 'سرعت پاسخگویی تیم فروش به درخواست‌های شما چگونه بود؟', 'choice', '{"options": ["بسیار سریع", "مناسب", "کند", "بسیار کند"]}', TRUE, 4),
(UUID(), @sales_form_id, 'آیا فرآیند خرید ساده و روان بود؟', 'choice', '{"options": ["بله، کاملاً", "تا حدودی", "خیر، پیچیده بود"]}', TRUE, 5),
(UUID(), @sales_form_id, 'نقاط قوت تیم فروش ما چه بود؟', 'textarea', NULL, FALSE, 6),
(UUID(), @sales_form_id, 'چه پیشنهاداتی برای بهبود عملکرد تیم فروش دارید؟', 'textarea', NULL, FALSE, 7),
(UUID(), @sales_form_id, 'آیا مایل به خرید مجدد از ما هستید؟', 'choice', '{"options": ["بله، حتماً", "احتمالاً", "خیر"]}', TRUE, 8);

-- Insert default questions for product feedback form
INSERT INTO feedback_form_questions (id, form_id, question, type, options, required, question_order)
VALUES
(UUID(), @product_form_id, 'میزان رضایت کلی شما از محصول چقدر است؟', 'rating', '{"min": 1, "max": 5}', TRUE, 1),
(UUID(), @product_form_id, 'کیفیت محصول را چگونه ارزیابی می‌کنید؟', 'rating', '{"min": 1, "max": 5}', TRUE, 2),
(UUID(), @product_form_id, 'آیا محصول با توضیحات ارائه شده مطابقت داشت؟', 'choice', '{"options": ["بله، کاملاً", "تا حدودی", "خیر، متفاوت بود"]}', TRUE, 3),
(UUID(), @product_form_id, 'نسبت کیفیت به قیمت محصول را چگونه ارزیابی می‌کنید؟', 'choice', '{"options": ["عالی", "خوب", "متوسط", "ضعیف"]}', TRUE, 4),
(UUID(), @product_form_id, 'کدام ویژگی محصول برای شما مفیدتر بود؟', 'textarea', NULL, FALSE, 5),
(UUID(), @product_form_id, 'کدام ویژگی محصول نیاز به بهبود دارد؟', 'textarea', NULL, FALSE, 6),
(UUID(), @product_form_id, 'آیا استفاده از محصول آسان بود؟', 'choice', '{"options": ["بله، بسیار آسان", "نسبتاً آسان", "کمی دشوار", "بسیار دشوار"]}', TRUE, 7),
(UUID(), @product_form_id, 'آیا این محصول را به دیگران پیشنهاد می‌دهید؟', 'choice', '{"options": ["بله، حتماً", "احتمالاً", "خیر"]}', TRUE, 8),
(UUID(), @product_form_id, 'هرگونه نظر یا پیشنهاد دیگری دارید؟', 'textarea', NULL, FALSE, 9);