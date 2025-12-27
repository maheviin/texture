const container = document.getElementById("buttons-container");

fetch("./manifest.json")
    .then(res => res.json())
    .then(data => {
        const list = data.catalogue || data;
        list.forEach(item => {
            const a = document.createElement("a");
            a.className = "texture-button";
            a.textContent = item.niceName || item.name;
            a.href = `gallery.html?name=${encodeURIComponent(item.name)}`;
            a.title = `Open ${item.niceName || item.name}`;

            container.appendChild(a);
        });
    })
    .catch(err => {
        console.error('Failed to load manifest.json', err);
        container.textContent = 'Failed to load textures.';
    });
