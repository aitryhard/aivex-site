(async () => {
    const $ = id => document.getElementById(id);

    try {
        const res = await fetch('https://api.github.com/repos/aitryhard/AIVEX/releases/latest');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const tag = data.tag_name;
        const exe = data.assets.find(a => a.name.endsWith('.exe'));
        const downloadUrl = exe ? exe.browser_download_url : data.html_url;
        const size = exe ? (exe.size / (1024 * 1024)).toFixed(0) + ' MB' : '—';
        let downloads = exe ? exe.download_count : 0;
        if (exe) {
            const assetRes = await fetch(exe.url);
            if (assetRes.ok) {
                const assetData = await assetRes.json();
                downloads = assetData.download_count;
            }
        }

        const versionTexts = document.querySelectorAll('#hero-version, #hero-version-2, #dl-version');
        versionTexts.forEach(el => { el.textContent = tag.replace(/^v/, ''); });

        $('hero-release-info').innerHTML = `Последняя версия: v${tag.replace(/^v/, '')}`;
        $('download-btn').href = downloadUrl;
        $('download-btn-text').textContent = `Скачать ${exe ? exe.name : tag}`;
        $('dl-size').textContent = size;
        $('dl-count').textContent = `${downloads} загрузок`;

        if (data.published_at) {
            const d = new Date(data.published_at);
            const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            const badge = document.querySelector('.hero-badge');
            if (badge) badge.textContent = `v${tag.replace(/^v/, '')} • Выпущено ${dateStr}`;
        }
    } catch (err) {
        console.warn('GitHub API error, using fallback:', err);

        $('download-btn').href = 'https://github.com/aitryhard/AIVEX/releases/latest';
        $('download-btn-text').textContent = 'Скачать последний релиз';
        $('dl-version').textContent = 'v1.1.2';
        $('dl-size').textContent = '~399 MB';
        $('dl-count').textContent = '—';
    }
})();
