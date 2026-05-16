/* 分页函数 */
function divide(arr, maxium_per_pages) {
    let result = [];
    for (let i = 0; i < arr.length; i += maxium_per_pages) {
        result.push(arr.slice(i, i + maxium_per_pages));
    }
    return {
        pages: result,
        totalPages: result.length
    };
}

/* 分页器页码生成 */
function generatePageList(pagesArray, currentPage) {
    const total = pagesArray.length;      // 总页数
    const maxSlots = 8;
    let str_num = [];
    let num = [];

    if (total <= maxSlots) {
        for (let i = 1; i <= total; i++) {
            str_num.push(String(i));
            num.push(i);
        }
        // 补齐到 maxSlots 个元素（用空格占位，实际不会显示）
        while (str_num.length < maxSlots) {
            str_num.push(" ");
            num.push(0);
        }
        return { strPgNum: str_num, PgNum: num, Now: currentPage };
    }

    // 总页数 > 8
    if (currentPage < 5) {
        str_num = ["1", "2", "3", "4", "5", "6", "...", String(total)];
        num = [1, 2, 3, 4, 5, 6, -1, total];
    } else if (currentPage > total - 5) {
        str_num = ["1", "...", String(total - 5), String(total - 4), String(total - 3), String(total - 2), String(total - 1), String(total)];
        num = [1, -1, total - 5, total - 4, total - 3, total - 2, total - 1, total];
    } else {
        str_num = ["1", "...", String(currentPage), String(currentPage + 1), String(currentPage + 2), String(currentPage + 3), "...", String(total)];
        num = [1, -1, currentPage, currentPage + 1, currentPage + 2, currentPage + 3, -1, total];
    }
    return { strPgNum: str_num, PgNum: num, Now: currentPage };
}