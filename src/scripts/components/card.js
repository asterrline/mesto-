export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton));
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};

export const createCardElementWithInfo = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick },
  userId
) => {
  const cardElement = createCardElement(data, { onPreviewPicture, onLikeIcon, onDeleteCard });
  
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");

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

  if (infoButton && onInfoClick) {
    infoButton.addEventListener("click", function() {
      onInfoClick(data._id || data.id);
    });
  }
  
  return cardElement;
};