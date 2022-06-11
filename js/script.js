const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById("add");
    const searchInput = document.getElementById("search-input");

    const searchBtn = document.getElementById("search-btn");

    submitForm.addEventListener("submit", function(event) {
        event.preventDefault();
        actionMessage("add");
        addBook();
    });

    searchInput.addEventListener("keyup", inputSearch);

    searchBtn.addEventListener("click", searchBtnMobile);

    if (isStorageExist()) {
        loadDataFromStorage();
    }
    countUnComplete();
    countComplete();
    totalBooks();
    onScroolNavbar();
});

function addBook() {
    const title = document.getElementById("title").value;
    const author = document.getElementById("writer").value;
    const year = document.getElementById("year").value;
    const check = document.getElementById("checked").checked;

    const id = generateId();

    if (check === true) {
        const bookObject = generateBookObject(id, title, author, year, true);
        books.push(bookObject);
    } else {
        const bookObject = generateBookObject(id, title, author, year, false);

        books.push(bookObject);
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, bookTitle, bookWriter, bookYear, isCompleted) {
    return {
        id,
        bookTitle,
        bookWriter,
        bookYear,
        isCompleted,
    };
}

function makeBook(bookObject) {
    const title = document.createElement("p");
    title.innerHTML = `Judul <h3>${bookObject.bookTitle}</h3>`;

    const textWriter = document.createElement("p");
    textWriter.innerHTML = `Penulis: <b>${bookObject.bookWriter}</b>`;

    const textYear = document.createElement("p");
    textYear.innerHTML = `Tahun terbit: <b>${bookObject.bookYear}</b>`;

    const article = document.createElement("article");
    article.classList.add("book_item");
    article.setAttribute("id", `${bookObject.id}`);

    article.appendChild(title);
    article.appendChild(textWriter);
    article.appendChild(textYear);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement("button");
        undoButton.innerHTML = "Baca lagi";
        undoButton.classList.add("undo-button");

        undoButton.addEventListener("click", function() {
            actionMessage("undo");
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.innerHTML = "Hapus";
        trashButton.classList.add("trash-button");

        trashButton.addEventListener("click", function() {
            actionMessage("delete");
            removeBookFromCompleted(bookObject.id);
        });

        const bookAction = document.createElement("div");
        bookAction.classList.add("action");

        bookAction.appendChild(undoButton);
        bookAction.appendChild(trashButton);

        article.append(bookAction);
    } else {
        const checkButton = document.createElement("button");
        checkButton.innerHTML = "Selesai membaca";
        checkButton.classList.add("check-button");

        checkButton.addEventListener("click", function() {
            actionMessage("check");
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.innerHTML = "Hapus";
        trashButton.classList.add("trash-button");

        trashButton.addEventListener("click", function() {
            actionMessage("not read delete");
            removeBookFromCompleted(bookObject.id);
        });
        const bookAction = document.createElement("div");
        bookAction.classList.add("action");

        bookAction.appendChild(checkButton);
        bookAction.appendChild(trashButton);
        article.append(bookAction);
    }

    return article;
}

function actionMessage(action) {
    const messageAddMewBook = document.getElementById("add-new-book");
    const messageRead = document.getElementById("read");
    const messageUnread = document.getElementById("unread");

    if (action === "check") {
        messageRead.innerText =
            "Berhasil! Buku telah dibaca dan di simpan ke rak selesai di baca, anda dapat membacanya lagi nanti";
        messageRead.classList.add("done");

        setTimeout(function() {
            messageRead.innerText = "";
            messageRead.classList.remove("done");
        }, 3000);

        return;
    } else if (action === "not read delete") {
        messageRead.innerText =
            "Berhasil! Buku telah dihapus, meskipun anda belum selesai membaca buku ini";
        messageRead.classList.add("deleted");

        setTimeout(function() {
            messageRead.innerText = "";
            messageRead.classList.remove("deleted");
        }, 3000);

        return;
    } else if (action === "undo") {
        messageUnread.innerText =
            "Berhasil! Buku telah dikembalikan ke rak belum dibaca";
        messageUnread.classList.add("undo");

        setTimeout(function() {
            messageUnread.innerText = "";
            messageUnread.classList.remove("undo");
        }, 3000);

        return;
    } else if (action === "delete") {
        messageUnread.innerText = "Berhasil! Buku telah dihapus.";
        messageUnread.classList.add("deleted");

        setTimeout(function() {
            messageUnread.innerText = "";
            messageUnread.classList.remove("deleted");
        }, 3000);

        return;
    } else if (action === "add") {
        messageAddMewBook.innerText = "Berhasil! Buku baru telah di tambahkan.";
        messageAddMewBook.classList.add("done");

        setTimeout(function() {
            messageAddMewBook.innerText = "";
            messageAddMewBook.classList.remove("done");
        }, 3000);

        return;
    }
}

function countUnComplete() {
    const uncompleted = document.getElementById("uncomplete");
    let count = 0;
    for (let i = 0; i < books.length; i++) {
        if (!books[i].isCompleted) {
            count++;
        }
    }
    if (count === 0) {
        uncompleted.innerText = "Belum ada buku";
    } else {
        uncompleted.innerText = `${count} buku belum dibaca`;
    }
}

function countComplete() {
    const completed = document.getElementById("complete");
    let count = 0;
    for (let i = 0; i < books.length; i++) {
        if (books[i].isCompleted) {
            count++;
        }
    }
    if (count === 0) {
        completed.innerText = "Belum ada buku yang selesai anda baca";
    } else {
        completed.innerText = `${count} buku telah selesai dibaca`;
    }
}

function totalBooks() {
    const booksTotal = document.getElementById("book_total");
    if (books.length === 0) {
        booksTotal.innerText = `Anda belum menambahkan buku`;
    } else {
        booksTotal.innerText = `Anda telah menambahkan ${books.length} buku.`;
    }
}

document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBOOKList = document.getElementById(
        "incompleteBookshelfList"
    );
    uncompletedBOOKList.innerHTML = "";

    const completedBOOKList = document.getElementById("completeBookshelfList");
    completedBOOKList.innerHTML = "";

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
        else completedBOOKList.append(bookElement);
    }
});

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// Web Storage
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function(e) {
    countUnComplete();
    countComplete();
    totalBooks();
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function onScroolNavbar() {
    let prevScrollpos = window.pageYOffset;
    window.onscroll = function() {
        let currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
            document.querySelector(".navbar").style.top = "0";
        } else {
            document.querySelector(".navbar").style.top = "-5rem";
        }
        prevScrollpos = currentScrollPos;
    };
}

function inputSearch(e) {
    const searchText = e.target.value.toLowerCase();
    const searchItemMatched = document.getElementById("search-result-list");

    for (let i = 0; i < books.length; i++) {
        const bookTitle = books[i].bookTitle;
        const bookWriter = books[i].bookWriter;
        const bookYear = books[i].bookYear;
        const bookId = books[i].id;
        const bookComplete = books[i].isCompleted;

        if (searchText !== "") {
            searchItemMatched.classList.add("show");
            if (
                bookTitle.toLowerCase().includes(searchText) ||
                bookWriter.toLowerCase().includes(searchText) ||
                bookYear.toLowerCase().includes(searchText)
            ) {
                searchItemMatched.innerHTML = `<li class="search-result-item" id="${bookId}">
                <p>Judul: <b>${bookTitle}</b></p>
                <p>Penulis: <b>${bookWriter}</b></p>
                <p>Tahun: <b>${bookYear}</b></p>
                <p>Status: <b>${
                  bookComplete ? "Sudah Dibaca" : "Belum Dibaca"
                }</b></p>
            </li>`;
            } else if (!bookTitle.toLowerCase().includes(searchText) ||
                !bookWriter.toLowerCase().includes(searchText) ||
                !bookYear.toLowerCase().includes(searchText)
            ) {
                searchItemMatched.innerHTML = `<li class="search-result-item" id="${bookId}">
                <p>Buku Tidak ditemukan!</p>
               <i>Masukan judul, penulis, atau tahun rilis buku.</i>
            </li>`;
            }
        } else {
            searchItemMatched.innerHTML = "";
            searchItemMatched.classList.remove("show");
        }
    }
}

function searchBtnMobile() {
    const searchBox = document.querySelector(".search-box");
    const searchInput = document.getElementById("search-input");
    searchInput.classList.toggle("active");
    searchBox.classList.toggle("active");
}

const footer = document.getElementsByTagName("footer")[0];
console.log(footer);
const footerDate = footer.querySelector("p span");
console.log(footerDate);
footerDate.innerText = new Date().getFullYear();