const BLOG_CONFIG = {
            name: "LiBertY",
            title: "是个傻福",
            bio: "I record.",
            avatar: './src/pub/Avatar.jpg',
            social: [
                { plarform: "GitHub", icon: "src/homepage/GitHub_Invertocat_Black.svg", url: "https://github.com/liumouren2006" },
                { plarform: "bilibili",icon: "src/homepage/Bilibili_tv_a.svg", url: "https://bilibili.com" },
                { plarform: "Mail",icon: "src/homepage/mail.svg", url: "mailto:hello@example.com" }
            ],
            articles: [
                { id: 1, selected: false, title: "如何构建一个响应式的亚克力风格网页", date: "2024-05-10", category: "技术", excerpt: "探索 CSS Backdrop-filter 与现代 UI 设计的结合之路..." ,link: "Articles/template.html"},
                { id: 2, selected: true, title: "Why objects move that way?", date: "2026-05-13", category: "物理", excerpt: "<i>Lorsqu'il arrive quelque changement dans la Nature, la quantité d'Action nécessaire pour ce changement est la plus petite qu'il soit possible.</i>" ,link: "Articles/template.html"},
                { id: 3, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                { id: 4, selected: true, title:"利用Fourier Transform绘制自己的图像", date:"2026-04-20" ,category: "数学", excerpt: "<i>我们小学二年级就学过的DFT (Discrete Fourier Transform) 能用来肝肾干么呢 ? <b>qwq</b></i>" ,link: "https://liumouren2006.github.io/DFT_Drawing"},
                // { id: 5, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 6, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 7, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 8, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 9, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 10, selected: false, title: "测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 11, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 12, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 13, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 14, selected: false, title: "文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 15, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 16, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 17, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 18, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 19, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 20, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 3, selected: false, title: "这只是测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 5, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 6, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 7, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 8, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 9, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 10, selected: false, title: "测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 11, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 12, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 13, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 14, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 15, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 16, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 17, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                // { id: 18, selected: false, title: "这只是一个测试文章", date: "2026-05-13", category: "Test", excerpt: "干嘛...都说了只是测试。" ,link: "Articles/template.html"},
                
            ],  
            aboutLong: `
                <p style="color:#5e55a2;"><b><font size="8">orz</font></b></p>
                <p>苦逼大学生一个, 啥也不会, 所以仍在学习中 (才怪) .</p>
                <div class='mt-6 p-4 bg-emerald-100/50 rounded-xl border border-emerald-200'>
                    <strong>我会啥：</strong> C (假的), Theoretical Phycics, HTML/CSS(大嘘x1), JavaScript (大嘘x2), Mathematic (仅限兴趣).
                </div>
            `
        };
