document.addEventListener('DOMContentLoaded', () => {
  const replyLinks = document.querySelectorAll('.reply');

  replyLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const commentId = link.getAttribute('data-id');
      const articleId = link.getAttribute('data-article-id');
      const userId = link.getAttribute('data-user-id');
      const replyContainer = document.getElementById(`reply-input-container-${commentId}`);

      // Periksa apakah input balasan sudah ada
      if (replyContainer.querySelector('.input-reply-wrapper')) {
        // Jika sudah ada, hapus input balasan
        replyContainer.innerHTML = '';
      } else {
        // Jika belum ada, tambahkan input balasan
        replyContainer.innerHTML = `
          <div class="input-reply-wrapper">
            <form action="/" method="POST">
              <input type="hidden" value="${articleId}" id="article_id" name="article_id">
              <input type="hidden" value="${userId}" id="user_id" name="user_id">
              <input type="hidden" value="${commentId}" id="parent_id" name="parent_id">
              <input type="text" id="comment" name="comment" class="input-reply" placeholder="Tulis balasan Anda di sini">
              <button class="btn-send-reply">
                <i class="far fa-paper-plane"></i>
              </button>
            </form>
          </div>
        `;
      }
    });
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const showReplyLinks = document.querySelectorAll('.show-replies');

  showReplyLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const commentId = link.getAttribute('data-id');
      const repliesContainer = document.getElementById(`replies-${commentId}`);

      if (repliesContainer.classList.contains('hidden')) {
        repliesContainer.classList.remove('hidden');
        link.textContent = 'Sembunyikan balasan';
      } else {
        repliesContainer.classList.add('hidden');
        link.textContent = 'Lihat balasan selengkapnya';
      }
    });
  });
});
