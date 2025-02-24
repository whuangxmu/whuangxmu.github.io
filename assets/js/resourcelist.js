class Resourcelist {
    constructor(data, containerId, prefix = '') {
        this.data = data;
        this.containerId = containerId;
        this.prefix = prefix;
    }

    generateList() {
        const list = document.createElement('ol');
        list.className = 'reference-list';
        this.data.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.style.display = 'flex';
            listItem.style.alignItems = 'flex-start';

            const indexSpan = document.createElement('span');
            indexSpan.className = 'index';
            indexSpan.style.minWidth = '30px';
            indexSpan.style.textAlign = 'right';
            indexSpan.style.marginRight = '10px';

            const contentSpan = document.createElement('span');
            contentSpan.className = 'content';
            contentSpan.style.flex = '1';

            if (item.site === undefined) {
                var address = item.path;
                indexSpan.innerHTML = `[<span id="${(item.id) ? (item.id) : (index + 1)}">S${index + 1}</span>]`;
                contentSpan.innerHTML = `<a href="${address}" target="_blank">${item.name}</a> .`;
            } else {
                var address = item.path;
                if (item.site !== 0) {
                    address = resourceListData[item.site - 1].path;
                    if (item.path){
                        if (item.site === 6)
                            address += "%2F" + encodeURI(item.path);
                        else
                            address += item.path;
                    }
                }
                indexSpan.innerHTML = `[<span id="${(item.id) ? (item.id) : (index + 1)}">${index + 1}</span>]`;
                contentSpan.innerHTML = `<a href="${address}" target="_blank">${item.name}</a>.`;
                if (item.file)
                    contentSpan.innerHTML += ` <span class="code">文件: ${item.file}</span>.`;
            }
            listItem.appendChild(indexSpan);
            listItem.appendChild(contentSpan);
            list.appendChild(listItem);
        });
        return list;
    }

    render() {
        const container = document.getElementById(this.containerId);
        container.appendChild(this.generateList());
    }
}