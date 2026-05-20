"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  HelpCircle,
  X,
  BookOpen,
  Info,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  LifeBuoy,
} from "lucide-react";

interface GuideSection {
  title: string;
  description: string;
  benefits: string[];
  tips: string[];
}

export function SystemGuide() {
  const pathname = usePathname();
  const { language } = useStore();
  const { isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("current");

  // Automatically reset tab when pathname changes
  useEffect(() => {
    setActiveTab("current");
  }, [pathname]);

  const getGuideContent = (path: string): GuideSection => {
    const isAr = language === "ar";
    
    if (path.startsWith("/dashboard")) {
      return {
        title: isAr ? "لوحة التحكم الرئيسية" : "Main Dashboard Summary",
        description: isAr 
          ? "هذه هي الصفحة الرئيسية للمتجر. تعرض لك ملخصاً سريعاً لأداء العمليات اليومية والشهرية، مثل المبيعات، الأرباح، الديون، والمصروفات بالرسوم البيانية."
          : "This is your main dashboard. It provides a real-time summary of daily and monthly store performance, sales, profits, debts, and expenses with visual charts.",
        benefits: isAr 
          ? [
              "مراقبة أرباحك الصافية لحظة بلحظة بعد خصم التكاليف والمصاريف.",
              "معرفة حجم الديون النشطة والمسددة بشكل سريع.",
              "متابعة حركة النقدية اليومية (الكاش) في خزينة المحل."
            ]
          : [
              "Track net profits in real-time after deducting costs and expenses.",
              "Quickly view active vs. recovered store debts.",
              "Monitor daily cash flow in the physical store register."
            ],
        tips: isAr
          ? [
              "ميزة مطابقة الخزينة (خزينة متجر أبو أنس) تضمن لك عدم وجود أي عجز أو سرقة في الكاش عند نهاية كل وردية.",
              "انظر إلى المؤشرات السريعة لمعرفة المنتجات الأكثر مبيعاً لتوفيرها باستمرار."
            ]
          : [
              "The Cash Drawer Reconciler ensures no shortage or cash discrepancies at the end of each shift.",
              "Check the 'Top Selling Products' widget to keep popular items in stock."
            ]
      };
    }

    if (path.startsWith("/sales/new")) {
      return {
        title: isAr ? "كاشير المبيعات الجديد (POS)" : "New POS Checkout Tray",
        description: isAr
          ? "هذه شاشة الكاشير السريعة لإجراء عمليات البيع. تم تصميمها لتناسب الهواتف المحمولة وأجهزة الكمبيوتر لتسهيل خدمة الزبائن في ثوانٍ معدودة."
          : "This is the Point of Sale page. Fully optimized for mobile and desktop screens to checkout customer carts in seconds.",
        benefits: isAr
          ? [
              "إضافة المنتجات للسلة بلمسة واحدة وتعديل كمياتها أو تطبيق الخصم فوراً.",
              "دعم البيع النقدي (كاش) والبيع الآجل (ديون) المربوط بأسماء العملاء.",
              "حساب الفاتورة تلقائياً وعرض المتبقي للعميل (الباقي)."
            ]
          : [
              "Add items to cart, edit quantities, and apply discounts instantly.",
              "Supports cash payments and outstanding debts mapped to customer names.",
              "Calculates totals and displays change back to the client automatically."
            ],
        tips: isAr
          ? [
              "إذا كانت الفاتورة ديناً، اضغط على خيار (آجل / دين) وحدد اسم العميل ليتم ترحيل المبلغ تلقائياً لحسابه.",
              "يمكنك طباعة الفاتورة أو حفظها كملف PDF لمشاركتها مع الزبون عبر الواتساب."
            ]
          : [
              "If the sale is on credit, select 'On Credit' and assign a customer to auto-log the debt.",
              "You can print the receipt or export it as PDF to share with the customer via WhatsApp."
            ]
      };
    }

    if (path.startsWith("/sales")) {
      return {
        title: isAr ? "سجل المبيعات والفواتير" : "Sales Ledger & Invoices",
        description: isAr
          ? "يعرض لك هذا القسم قائمة بجميع الفواتير والعمليات التي تمت في المحل مع إمكانية البحث والتصفية حسب التاريخ أو اسم العميل."
          : "This section displays the ledger of all transactions processed in the store, with filtering by date, payment type, or customer.",
        benefits: isAr
          ? [
              "استعراض تفاصيل أي فاتورة سابقة والمنتجات التي تم شراؤها.",
              "إمكانية طباعة أو إعادة تحميل أي فاتورة في أي وقت.",
              "تتبع مبيعات كل موظف على حدة."
            ]
          : [
              "Review the items and discounts of any past invoice.",
              "Reprint or download historical receipts at any time.",
              "Audit transaction history and track cashier details."
            ],
        tips: isAr
          ? [
              "استخدم شريط البحث للعثور على فاتورة برقمها أو باسم العميل بسرعة.",
              "تصفية الفواتير حسب (كاش / آجل) تساعدك في مطابقة حسابات المبيعات اليومية."
            ]
          : [
              "Use the search box to find invoices by invoice number or client name.",
              "Filter invoices by Cash vs Credit to simplify daily sales audits."
            ]
      };
    }

    if (path.startsWith("/debts")) {
      return {
        title: isAr ? "إدارة الديون والأقساط" : "Credit & Debts Manager",
        description: isAr
          ? "من أهم الأقسام للمحل. يتيح لك تتبع الديون المستحقة على العملاء، وتسجيل الدفعات الجديدة، لمعرفة المبالغ المتبقية في ذمتهم."
          : "A critical tool to monitor customer credit balances, log repayments, and track remaining outstanding amounts.",
        benefits: isAr
          ? [
              "عرض تفصيلي لديون كل عميل وتاريخ استحقاقها.",
              "تسجيل سداد الديون (كلياً أو جزئياً) وتحديث رصيد العميل فوراً.",
              "تنبيهات تلقائية للديون المتأخرة التي تجاوزت موعد سدادها."
            ]
          : [
              "View total credit outstanding per customer and their due dates.",
              "Log customer payments (partial or full) and update ledger balances.",
              "Automatic alerts for past due debts that require follow-up."
            ],
        tips: isAr
          ? [
              "عند سداد العميل لجزء من الدين، اضغط على (تسجيل دفعة) واكتب المبلغ المستلم ليتم طرحه تلقائياً وتحديث إجمالي الدين.",
              "حافظ على تحديث تواريخ الاستحقاق لتظهر لك التنبيهات باللون الأحمر للديون المتأخرة."
            ]
          : [
              "Click 'Log Repayment' when a customer pays back part of their debt to update the ledger.",
              "Keep due dates updated to trigger color-coded red alerts for late accounts."
            ]
      };
    }

    if (path.startsWith("/products")) {
      return {
        title: isAr ? "إدارة المنتجات والمخزن" : "Inventory & Products",
        description: isAr
          ? "لوحة التحكم بالمخزن لإضافة السلع وتحديث الأسعار (سعر الشراء وسعر البيع) ومتابعة الكميات المتاحة في الرفوف."
          : "The inventory control center to add new items, modify cost/retail prices, and manage active stock counts.",
        benefits: isAr
          ? [
              "حساب التكلفة الإجمالية والقيمة المالية للبضاعة الموجودة في المحل.",
              "التنبيه التلقائي للمنتجات التي أوشكت على النفاد (الحد الأدنى للمخزون).",
              "إمكانية تصنيف المنتجات إلى فئات لتسهيل الوصول إليها."
            ]
          : [
              "Evaluate total cost and financial value of assets in stock.",
              "Get alerts when product levels fall below minimum quantity safety margins.",
              "Categorize products to locate items quickly during POS checkouts."
            ],
        tips: isAr
          ? [
              "احرص على كتابة سعر الشراء بدقة لتتمكن لوحة التحكم من حساب أرباحك الصافية بشكل صحيح.",
              "حدد 'الحد الأدنى للمخزون' لكل منتج ليقوم النظام بتنبيهك فوراً عند اقتراب نفاده لتطلب دفعة جديدة."
            ]
          : [
              "Always enter precise buy/cost price to enable accurate net profit calculations.",
              "Set a 'Minimum Stock Level' for items to get flagged when they run low."
            ]
      };
    }

    if (path.startsWith("/customers")) {
      return {
        title: isAr ? "إدارة العملاء والزبائن" : "Customer Accounts",
        description: isAr
          ? "سجل كامل بأسماء العملاء، أرقام هواتفهم، وعناوينهم، مع ملخص سريع لحالة ديون كل عميل."
          : "A database of client profiles containing names, phone numbers, addresses, and individual balance summaries.",
        benefits: isAr
          ? [
              "معرفة العملاء الأكثر تعاملاً مع المحل والأكثر التزاماً بالسداد.",
              "إمكانية الضغط على اسم العميل لاستعراض تاريخ مشترياته وديونه بالكامل.",
              "تسهيل التواصل السريع مع العملاء عبر الهاتف."
            ]
          : [
              "Identify high-value customers and reliable payers.",
              "Click any customer to review full invoice and repayment histories.",
              "Directly call or contact clients using registered phone numbers."
            ],
        tips: isAr
          ? [
              "قبل بيع بضاعة بالآجل، تأكد من إضافة العميل أولاً في هذا القسم حتى يظهر اسمه في شاشة الكاشير.",
              "يمكنك تصدير قائمة العملاء لمتابعة الحسابات خارج النظام."
            ]
          : [
              "Ensure customers are registered in this database before creating sales on credit.",
              "You can export the customer list to monitor credit offline."
            ]
      };
    }

    if (path.startsWith("/expenses")) {
      return {
        title: isAr ? "المصروفات والتشغيل" : "Operational Expenses",
        description: isAr
          ? "هنا تقوم بتسجيل كافة التكاليف والمصاريف اليومية والشهرية للمحل (مثل الكهرباء، الإيجار، الرواتب، النقل) التي لا تتعلق بشراء البضاعة مباشرة."
          : "Log all daily and monthly overhead costs (electricity, rent, salaries, transport) to accurately audit business performance.",
        benefits: isAr
          ? [
              "خصم المصاريف تلقائياً من الأرباح الإجمالية لحساب صافي الربح الحقيقي.",
              "تصنيف المصروفات لمعرفة أين تذهب أموال المتجر.",
              "حفظ الفواتير والإيصالات الخاصة بالمصروفات."
            ]
          : [
              "Automatically deduct overheads from gross sales to track real net profits.",
              "Categorize bills to visualize where your store's money is going.",
              "Log receipt documents and reference details for every expense."
            ],
        tips: isAr
          ? [
              "لا تغفل عن تسجيل أي مصروف ولو كان بسيطاً، لأن ذلك يؤثر مباشرة على حساب أرباحك بنهاية الشهر.",
              "يمكنك إضافة فئات مصاريف مخصصة تناسب طبيعة عمل المحل."
            ]
          : [
              "Log every minor expenditure to ensure monthly net calculations are completely accurate.",
              "Create custom expense categories to match your store's operations."
            ]
      };
    }

    if (path.startsWith("/reports")) {
      return {
        title: isAr ? "التقارير التحليلية والمالية" : "Financial Analytics & Reports",
        description: isAr
          ? "يجمع لك هذا القسم كافة البيانات والعمليات ليعطيك صورة واضحة ومبسطة للوضع المالي والنمو التجاري لمتجرك."
          : "Consolidates all business activities into comprehensive graphs and financial statements to guide strategic planning.",
        benefits: isAr
          ? [
              "مقارنة المبيعات والأرباح والمصاريف بين الأشهر المختلفة لمعرفة فترات الركود والنشاط.",
              "تقارير مفصلة عن حركة الديون والأقساط المحصلة.",
              "إمكانية طباعة وتصدير التقارير المالية لتقديمها للمحاسب."
            ]
          : [
              "Compare sales, revenue, and expenses across different months.",
              "Review detailed audits on debt recovery rates.",
              "Print or export quarterly/annual performance logs for reference."
            ],
        tips: isAr
          ? [
              "استخدم التصفية الزمنية (مثلاً: آخر 30 يوماً أو هذا الشهر) لتركيز تحليلاتك على الفترات القريبة.",
              "الرسوم البيانية الملونة مصممة لتسهيل قراءة الأرقام المالية بلمحة سريعة."
            ]
          : [
              "Use custom date ranges to isolate specific business periods.",
              "Color-coded graphs simplify scanning indicators at a glance."
            ]
      };
    }

    if (path.startsWith("/settings")) {
      return {
        title: isAr ? "إعدادات متجر أبو أنس" : "Store & Invoice Settings",
        description: isAr
          ? "غرفة التحكم بالنظام لتهيئة وتخصيص المتجر، تعديل بيانات المبيعات، حماية الحسابات، وإدارة فريق العمل."
          : "The admin control center to brand receipts, configure taxes, change passwords, and manage user roles.",
        benefits: isAr
          ? [
              "تغيير اسم المحل وشعاره ورسالة تذييل الفاتورة المطبوعة.",
              "تغيير كلمة مرور المدير وتأمين حساب المسؤول الرئيسي.",
              "إضافة وحذف حسابات الموظفين وتفعيل أو تعطيل صلاحياتهم."
            ]
          : [
              "Brand invoice formats, add custom store slogans, and set local tax rates.",
              "Change security credentials for the manager account.",
              "Add, remove, or toggle active status of employee login credentials."
            ],
        tips: isAr
          ? [
              "احرص على كتابة اسم المتجر ورقم الهاتف والعنوان بشكل صحيح لأنها ستظهر مباشرة في أعلى جميع الفواتير المطبوعة.",
              "من هنا يمكنك عمل نسخة احتياطية (Backup) بانتظام لحماية بياناتك من الضياع وتنزيلها على جهازك."
            ]
          : [
              "Double-check store details as they populate directly on receipt headers.",
              "Use the 'Backup & Restore' section regularly to save system state local database backup files."
            ]
      };
    }

    // Default Fallback Guide
    return {
      title: isAr ? "دليل المساعد الذكي" : "Smart Store Assistant",
      description: isAr
        ? "أهلاً بك في نظام متجر أبو أنس لإدارة موارد المتجر (ERP). هذا النظام مصمم لمساعدتك على إدارة تجارتك وحسابات مبيعاتك وديونك بكل سهولة وأمان."
        : "Welcome to Abo Anas Store ERP. A unified portal designed to simplify sales tracking, inventory bookkeeping, and credit management securely.",
      benefits: isAr
        ? [
            "واجهة سريعة ومتجاوبة تماماً مع شاشات الهواتف المحمولة وأجهزة الكمبيوتر.",
            "نظام مالي متكامل يحميك من الأخطاء الحسابية والعجز المالي.",
            "إدارة موظفين وصلاحيات قوية لحماية خصوصية بياناتك."
          ]
        : [
            "Responsive layout tailored for smartphone and desktop viewports.",
            "Fully automated registers to prevent accounting discrepancies.",
            "Granular user permissions to protect management operations."
          ],
      tips: isAr
        ? [
            "يمكنك النقر على زر المساعد (?) في أي صفحة لعرض شرح تفصيلي مخصص لتلك الصفحة.",
            "تذكر دائماً أخذ نسخة احتياطية من الإعدادات بانتظام لحفظ نسخة آمنة من بياناتك."
          ]
        : [
            "Tap this floating helper icon (?) on any screen to read about that page.",
            "Make sure to download regular backups to secure your data."
          ]
    };
  };

  const currentGuide = getGuideContent(pathname);
  const isAr = language === "ar";

  const allSections = [
    { path: "/dashboard", name: isAr ? "لوحة التحكم" : "Dashboard" },
    { path: "/sales/new", name: isAr ? "كاشير المبيعات (POS)" : "Sales (POS)" },
    { path: "/sales", name: isAr ? "سجل المبيعات" : "Sales Ledger" },
    { path: "/debts", name: isAr ? "إدارة الديون" : "Debts Manager" },
    { path: "/products", name: isAr ? "إدارة المخزن" : "Inventory" },
    { path: "/customers", name: isAr ? "قائمة العملاء" : "Customers" },
    { path: "/expenses", name: isAr ? "المصروفات" : "Expenses" },
    { path: "/reports", name: isAr ? "التقارير" : "Reports" },
    { path: "/settings", name: isAr ? "الإعدادات" : "Settings" },
  ];

  return (
    <>
      {/* Floating Helper Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-primary/20"
        title={isAr ? "دليل المساعد الذكي" : "Smart Assistant Guide"}
      >
        <LifeBuoy className="h-6 w-6 animate-spin-slow text-white" />
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] text-white font-extrabold items-center justify-center">?</span>
        </span>
      </button>

      {/* Helper Side Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Drawer Container */}
          <div
            className={`w-full max-w-md bg-card border-l border-border h-full flex flex-col relative z-10 shadow-2xl animate-slide-in-right p-6 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    {isAr ? "المساعد الذكي لمتجر أبو أنس" : "Abo Anas ERP Guide"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {isAr ? "شرح تفاعلي للأقسام والميزات" : "Interactive feature guide & tips"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs inside Drawer */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-muted/40 rounded-xl border border-border">
              <button
                onClick={() => setActiveTab("current")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "current" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {isAr ? "شرح الصفحة الحالية" : "Current Screen"}
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {isAr ? "تصفح جميع الأقسام" : "All Sections"}
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {activeTab === "current" ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Current Section Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-primary">
                      <BookOpen className="h-4.5 w-4.5" />
                      <span className="font-extrabold text-sm uppercase tracking-wider">{currentGuide.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3.5 border border-border rounded-2xl">
                      {currentGuide.description}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-foreground uppercase tracking-wider block">
                      {isAr ? "💡 ماذا تستفيد من هذا القسم؟" : "What is this used for?"}
                    </span>
                    <ul className="space-y-2">
                      {currentGuide.benefits.map((benefit, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips & Warnings */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-extrabold text-foreground uppercase tracking-wider block">
                      {isAr ? "⚡ نصائح وإرشادات هامة:" : "Important Tips & Advice:"}
                    </span>
                    <ul className="space-y-2">
                      {currentGuide.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="bg-amber-500/5 text-amber-800 dark:text-amber-300 border border-amber-500/10 px-2 py-1 rounded-xl w-full">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                    {isAr ? "اختر أي قسم لقراءة الشرح الخاص به:" : "Select a section to learn more:"}
                  </span>
                  <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
                    {allSections.map((sec) => {
                      const secGuide = getGuideContent(sec.path);
                      return (
                        <details key={sec.path} className="group transition-colors hover:bg-muted/10">
                          <summary className="p-4 flex items-center justify-between font-bold text-xs text-foreground cursor-pointer list-none focus:outline-none">
                            <span>{sec.name}</span>
                            <span className="text-muted-foreground group-open:rotate-90 transition-transform">
                              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                          </summary>
                          <div className="px-4 pb-4 space-y-3 text-start border-t border-border/50 pt-3">
                            <p className="text-xs text-muted-foreground leading-relaxed font-light">
                              {secGuide.description}
                            </p>
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider block">
                                {isAr ? "💡 نصيحة مفيدة:" : "Tip:"}
                              </span>
                              <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg">
                                {secGuide.tips[0]}
                              </p>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 text-center">
              <p className="text-[10px] text-muted-foreground">
                {isAr 
                  ? "متجر أبو أنس - نظام الإدارة المتكاملة الذكي ٢٠٢٦" 
                  : "Abo Anas Store - Smart ERP Management 2026"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
