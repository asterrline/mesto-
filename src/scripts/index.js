/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { enableValidation, clearValidation } from "./components/validation.js";
import { initialCards } from "./cards.js";
import { createCardElement, createCardElementWithInfo, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow ? cardInfoModalWindow.querySelector(".popup__info-list") : null;

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible"
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleCardInfoClick = (cardId) => {
  const targetCard = initialCards.find(item => (item._id === cardId || item.id === cardId));
  
  if (!targetCard) return;

  cardInfoModalInfoList.textContent = "";

  const dateObj = new Date(targetCard.createdAt || Date.now());
  const formattedDate = dateObj.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dateListItem = document.createElement("li");
  dateListItem.textContent = `Дата создания: ${formattedDate}`;

  cardInfoModalInfoList.append(dateListItem);

  openModalWindow(cardInfoModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileTitle.textContent = profileTitleInput.value;
  profileDescription.textContent = profileDescriptionInput.value;
  closeModalWindow(profileFormModalWindow);
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
  closeModalWindow(avatarFormModalWindow);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  placesWrap.prepend(
    createCardElementWithInfo(
      {
        name: cardNameInput.value,
        link: cardLinkInput.value,
      },
      {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: deleteCard,
        onInfoClick: handleCardInfoClick
      }
    )
  );

  closeModalWindow(cardFormModalWindow);
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

// отображение карточек
initialCards.forEach((data) => {
  placesWrap.append(
    createCardElementWithInfo(data, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
      onInfoClick: handleCardInfoClick
    })
  );
});

enableValidation(validationConfig);

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
