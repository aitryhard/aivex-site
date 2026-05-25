(async () => {
    const $ = id => document.getElementById(id);

    try {
        const [latestRes, allRes] = await Promise.all([
            fetch('https://api.github.com/repos/aitryhard/AIVEX/releases/latest'),
            fetch('https://api.github.com/repos/aitryhard/AIVEX/releases?per_page=100')
        ]);
        if (!latestRes.ok) throw new Error('HTTP ' + latestRes.status);

        const latest = await latestRes.json();
        const tag = latest.tag_name;
        const exe = latest.assets.find(a => a.name.endsWith('.exe'));
        const downloadUrl = exe ? exe.browser_download_url : latest.html_url;
        const size = exe ? (exe.size / (1024 * 1024)).toFixed(0) + ' MB' : '—';

        let totalDownloads = 0;
        if (allRes.ok) {
            const allReleases = await allRes.json();
            for (const release of allReleases) {
                for (const asset of release.assets) {
                    if (asset.name.endsWith('.exe')) {
                        totalDownloads += asset.download_count;
                    }
                }
            }
        } else {
            totalDownloads = exe ? exe.download_count : 0;
        }

        document.querySelectorAll('#hero-version, #hero-version-2, #dl-version')
            .forEach(el => { el.textContent = tag.replace(/^v/, ''); });
        $('hero-release-info').innerHTML = `Последняя версия: v${tag.replace(/^v/, '')}`;
        $('download-btn').href = downloadUrl;
        $('download-btn-text').textContent = `Скачать ${exe ? exe.name : tag}`;
        $('dl-size').textContent = size;
        $('dl-count').textContent = `${totalDownloads} загрузок`;

        if (latest.published_at) {
            const d = new Date(latest.published_at);
            const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            const badge = document.querySelector('.hero-badge');
            if (badge) badge.textContent = `v${tag.replace(/^v/, '')} • Выпущено ${dateStr}`;
        }
    } catch (err) {
        console.warn('GitHub API error, using fallback:', err);
        $('download-btn').href = 'https://github.com/aitryhard/AIVEX/releases/latest';
        $('download-btn-text').textContent = 'Скачать последний релиз';
        $('dl-version').textContent = 'v1.1.3';
        $('dl-size').textContent = '~249 MB';
        $('dl-count').textContent = '—';
    }
})();
