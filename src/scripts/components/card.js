export const likeCard = (cardElement, updatedCardData, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");

  if (likeCounter && updatedCardData.likes) {
    likeCounter.textContent = updatedCardData.likes.length;
  }

  const isLikedByMe = updatedCardData.likes.some(user => user._id === userId);
  
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .querySelector("#card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick },
  userId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCounter = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (likeCounter && data.likes) {
    likeCounter.textContent = data.likes.length;
  }

  if (data.likes && userId && data.likes.some(user => user._id === userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner && userId && data.owner._id !== userId) {
    if (deleteButton) {
      deleteButton.remove();
    }
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  if (infoButton && onInfoClick) {
    infoButton.addEventListener("click", () => {
      onInfoClick(data._id || data.id);
    });
  }

  return cardElement;
};
