// 全局变量
let allpage = [];       // 分页后的二维数组
let totalPages = 0;     // 总页数
let currentPage = 1;    // 当前页码

// 渲染指定页的文章列表
function renderList(pageNo) {
    const container = document.getElementById('all-articles-list');
    if (!container) return;
    container.innerHTML = '';   // 清空

    const pageData = allpage[pageNo - 1];
    if (!pageData) return;

    pageData.forEach(post => {
        container.innerHTML += `
            <a href="${post.link}">
                <div class="glass-panel p-4 rounded-2xl hover:bg-white/60 transition-all cursor-pointer flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold text-emerald-900">${post.title}</h4>
                        <p class="text-xs text-emerald-600/60">${post.date} · <b class="text-emerald-600 uppercase">${post.category}</b></p>
                    </div>
                    <img alt="->" src="src/pub/arrow-right.svg" class="w-5 h-5">
                </div>
            </a>
        `;
    });
}

// 渲染分页器（已适配手机端，条目数少每页最大条目数于自动隐藏）
function renderPagination(pg, total) {
    const container = document.getElementById('pagination');
    if (!container) return;

    // 安全容错：如果总页数小于等于 1，直接清空不显示分页
    if (!total || total <= 1) {
        container.innerHTML = '';
        return;
    }

    const { strPgNum, PgNum, Now } = pg;
    const hasPrev = Now > 1;
    const hasNext = Now < total;

    let html = '<ul class="pagination">';
    
    // 1. 首页 (加上 page-home 类名用于手机端隐藏)
    if (hasPrev) {
        html += `<li><a class="page-home" onclick="changePage(1)"><span class="nav-text">首页</span></a></li>`;
    } else {
        html += `<li><span class="disabled page-home"><span class="nav-text">首页</span></span></li>`;
    }
    
    // 2. 上一页 (‹)
    if (hasPrev) {
        html += `<li><a onclick="changePage(${Now - 1},totalPages,allpage)">‹</a></li>`;
    } else {
        html += `<li><span class="disabled">‹</span></li>`;
    }

    // 3. 中间数字与省略号
    for (let i = 0; i < strPgNum.length; i++) {
        const num = PgNum[i];
        const label = strPgNum[i];
        
        // 同时捕捉后台返回的英文三个点 '...' 和中文全角点 '…'
        if (num === -1 || label === '...' || label === '…') {
            html += `<li><span class="ellipsis">...</span></li>`;
        } else {
            const isActive = (num === Now);
            if (isActive) {
                html += `<li><a class="active">${label}</a></li>`;
            } else {
                html += `<li><a onclick="changePage(${num},totalPages,allpage)">${label}</a></li>`;
            }
        }
    }

    // 4. 下一页 (›)
    if (hasNext) {
        html += `<li><a onclick="changePage(${Now + 1},totalPages,allpage)">›</a></li>`;
    } else {
        html += `<li><span class="disabled">›</span></li>`;
    }
    
    // 5. 尾页 (加上 page-end 类名用于手机端隐藏)
    if (hasNext) {
        html += `<li><a class="page-end" onclick="changePage(${total},totalPages,allpage)"><span class="nav-text">尾页</span></a></li>`;
    } else {
        html += `<li><span class="disabled page-end"><span class="nav-text">尾页</span></span></li>`;
    }
    
    html += '</ul>';
    container.innerHTML = html;
}

// 初始化博客内容（头像、简介等）
function initBlog() {
    document.title = `${BLOG_CONFIG.name} 的个人主页`;
    document.getElementById('profile-name').innerHTML = `你好，我是 <span class="text-emerald-600">${BLOG_CONFIG.name}</span>`;
    document.getElementById('profile-bio').innerText = BLOG_CONFIG.bio;
    document.getElementById('profile-pic').src = BLOG_CONFIG.avatar;
    document.getElementById('footer-name').innerText = BLOG_CONFIG.name;
    document.getElementById('year').innerText = new Date().getFullYear();
    document.getElementById('about-content').innerHTML = BLOG_CONFIG.aboutLong;

    // 社交链接
    const socialContainer = document.getElementById('social-links');
    socialContainer.innerHTML = '';
    BLOG_CONFIG.social.forEach(item => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = "w-12 h-12 glass-panel rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all hover-lift";
        link.innerHTML = `<img alt="${item.plarform}" src="${item.icon}" class="w-5 h-5">`;
        socialContainer.appendChild(link);
    });

    // 精选文章
    const featuredContainer = document.getElementById('featured-posts');
    featuredContainer.innerHTML = '';
    BLOG_CONFIG.articles.forEach(post => {
        if (post.selected) {
            featuredContainer.innerHTML += `
                <a href="${post.link}">
                    <div class="glass-panel p-6 rounded-3xl hover-lift cursor-pointer group">
                        <h4 class="text-xl font-bold mt-2 mb-3 group-hover:text-emerald-600 transition-colors">${post.title}</h4>
                        <p class="text-emerald-800/60 text-sm mb-4">${post.excerpt}</p>
                        <div class="flex justify-between items-center text-xs text-emerald-800/40 font-medium">
                            <span>${post.date}</span> <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest">${post.category}</span>
                        </div>
                    </div>
                </a>
            `;
        }
    });

    lucide.createIcons();
}

// 切换页面（文章列表）
function changePage(pageNo,totalPages,allpage) {
    if (pageNo < 1 || pageNo > totalPages) return;
    currentPage = pageNo;
    renderList(currentPage);
    const pg = generatePageList(allpage, currentPage);
    renderPagination(pg, totalPages);
    // 确保视图切换到文章页
    showView('articles', false); // 第二个参数表示不清空列表
}

// 视图切换
function showView(viewId, keepList = false) {
    const views = document.querySelectorAll('.view-content');
    views.forEach(v => {
        v.classList.remove('active');
        setTimeout(() => {
            if (!v.classList.contains('active')) v.style.display = 'none';
        }, 500);
    });

    const target = document.getElementById(viewId);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active'), 50);

    // 如果切换到文章视图且需要刷新列表（首次或强制刷新）
    if (viewId === 'articles' && !keepList) {
        renderList(currentPage);
        const pg = generatePageList(allpage, currentPage);
        renderPagination(pg, totalPages);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

