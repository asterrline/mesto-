const renderLikesState = (likeButton, likeCounter, likesData, userId) => {
  if (likeCounter && likesData) {
    likeCounter.textContent = likesData.length;
  }
  
  const isLikedByMe = likesData?.some(user => user._id === userId) ?? false;
  likeButton.classList.toggle("card__like-button_is-active", isLikedByMe);
};

export const likeCard = (cardElement, updatedCardData, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");
  
  renderLikesState(likeButton, likeCounter, updatedCardData.likes, userId);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .querySelector("#card-template") // Используем селектор id, как в html
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

  renderLikesState(likeButton, likeCounter, data.likes, userId);

  if (data.owner && userId && data.owner._id !== userId) {
    deleteButton?.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onDeleteCard) {
    deleteButton?.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  if (onInfoClick) {
    infoButton?.addEventListener("click", () => onInfoClick(data._id || data.id));
  }

  return cardElement;
};
