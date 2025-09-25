async function nativeShare(title, url) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, url });
    return true;
  } catch (error) {
    if (error?.name !== "AbortError") {
      alert("Не удалось поделиться ссылкой. Попробуйте ещё раз.");
      return false;
    }
    return true;
  }
}

async function copyToClipboard(url) {
  try {
    await navigator.clipboard.writeText(url);
    alert("Ссылка скопирована в буфер обмена");
  } catch (error) {
    prompt("Скопируйте ссылку вручную:", url);
  }
}

export function initShareFeatures() {
  const shareButton = document.getElementById("shareLink");
  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const url = window.location.href;
      const title = document.title;
      const shared = await nativeShare(title, url);
      if (!shared) {
        await copyToClipboard(url);
      }
    });
  }

  const year = new Date().getFullYear();
  const primaryYear = document.getElementById("y");
  const secondaryYear = document.getElementById("y2");
  if (primaryYear) primaryYear.textContent = String(year);
  if (secondaryYear) secondaryYear.textContent = String(year);
}
