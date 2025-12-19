const container = document.getElementById("buttons-container");

fetch("./manifest.json")
    .then(res => res.json())
    .then(data => {
        const list = data.catalogue || data;
        list.forEach(item => {
            const btn = document.createElement("div");
            btn.className = "texture-button";
            btn.textContent = item.name;

            container.appendChild(btn);
        });
    })
    .catch(err => {
        console.error('Failed to load manifest.json', err);
        container.textContent = 'Failed to load textures.';
    });
