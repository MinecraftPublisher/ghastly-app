// cache assets/ambient.mp3
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('scary-stories').then(function(cache) {
            return cache.addAll([
                '/assets/audio.mp3',
                '/fonts/valium.ttf',
                '/assets/sent.mp3',
                '/assets/received.mp3',
            ]);
        })
    );
});