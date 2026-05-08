const path = require('path');
const fs = require('fs');

const getLogoUrl = (logo, logoType, name) => {
    // Nếu là đường link URL
    if (logoType === 'url' && logo && logo.startsWith('http')) {
        return logo;
    }
    
    // Nếu là file local
    if (logoType === 'local' && logo) {
        // Đảm bảo đường dẫn đúng
        const localPath = logo.startsWith('/') ? logo : `/${logo}`;
        return localPath;
    }
    
    // Nếu có logo nhưng không xác định type, tự động kiểm tra
    if (logo) {
        if (logo.startsWith('http')) {
            return logo;
        } else {
            return logo.startsWith('/') ? logo : `/${logo}`;
        }
    }
    
    // Mặc định trả về placeholder
    return `/images/default-logo.svg`;
};

const isValidLocalImage = (logoPath) => {
    if (!logoPath) return false;
    
    // Tìm file trong thư mục publics
    const fullPath = path.join(__dirname, '../publics', logoPath);
    return fs.existsSync(fullPath);
};

module.exports = {
    getLogoUrl,
    isValidLocalImage
};