// Browser Notification Utility

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('Bu tarayıcı bildirimler desteklenmiyor');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
        return null;
    }

    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/code_alchemist_logo.png',
            badge: '/code_alchemist_logo.png',
            vibrate: [200, 100, 200],
            tag: options.tag || 'codealchemist-notification',
            renotify: options.renotify || false,
            ...options
        });

        notification.onclick = (event) => {
            event.preventDefault();
            window.focus();
            notification.close();
            if (options.onClick) {
                options.onClick();
            }
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
    }

    return null;
};

export const notifyNewPost = (authorName, postTitle) => {
    return sendNotification(`📝 ${authorName} yeni bir post paylaştı`, {
        body: postTitle || 'Yeni bir içerik paylaşıldı',
        tag: 'new-post',
        renotify: true
    });
};

export const notifyNewComment = (authorName, postTitle) => {
    return sendNotification(`💬 ${authorName} yorum yaptı`, {
        body: `"${postTitle?.substring(0, 50)}..." postuna yorum yapıldı`,
        tag: 'new-comment',
        renotify: true
    });
};

export const notifyNewLike = (authorName, postTitle) => {
    return sendNotification(`❤️ ${authorName} postunu beğendi`, {
        body: postTitle?.substring(0, 50) || 'Postun beğenildi',
        tag: 'new-like'
    });
};

export const notifyNewFollower = (followerName) => {
    return sendNotification(`👥 ${followerName} seni takip etmeye başladı`, {
        body: 'Yeni bir takipçin var!',
        tag: 'new-follower',
        renotify: true
    });
};

// Check if notifications are enabled
export const isNotificationEnabled = () => {
    return 'Notification' in window && Notification.permission === 'granted';
};
