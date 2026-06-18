/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import "../pages/index.css";
import { getUserInfo, getCardList, updateUserInfo, addNewCard, deleteCardFromServer, updateUserAvatar, changeLikeCardStatus } from "./components/api.js";
import { enableValidation, clearValidation } from "./components/validation.js";
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
  getCardList()
    .then((cards) => {
      const targetCard = cards.find(item => (item._id === cardId || item.id === cardId));
      
      if (!targetCard) return;

      cardInfoModalInfoList.textContent = "";

      const dateObj = new Date(targetCard.createdAt || Date.now());
      const formattedDate = dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const descriptionItem = document.createElement("li");
      descriptionItem.innerHTML = `<span class="popup__info-label">Описание:</span> ${targetCard.name || '—'}`;

      const dateListItem = document.createElement("li");
      dateListItem.innerHTML = `<span class="popup__info-label">Дата создания:</span> ${formattedDate}`;

      const ownerItem = document.createElement("li");
      const ownerName = targetCard.owner ? targetCard.owner.name : "Неизвестен";
      ownerItem.innerHTML = `<span class="popup__info-label">Владелец:</span> ${ownerName}`;

      const likesCountItem = document.createElement("li");
      const likesCount = targetCard.likes ? targetCard.likes.length : 0;
      likesCountItem.innerHTML = `<span class="popup__info-label">Количество лайков:</span> ${likesCount}`;

      const likedByTitleItem = document.createElement("li");
      likedByTitleItem.innerHTML = `<strong>Лайкнули:</strong>`;
      
      const likedByListWrapper = document.createElement("li");
      if (targetCard.likes && targetCard.likes.length > 0) {
        targetCard.likes.forEach((user) => {
          const userElement = document.createElement("span");
          
          userElement.classList.add("popup__info-user");
          userElement.textContent = user.name;

          likedByListWrapper.append(userElement);
        });
      } else {
        likedByListWrapper.textContent = "Пока никто не лайкнул";
      }

      cardInfoModalInfoList.append(
        descriptionItem,
        dateListItem,
        ownerItem,
        likesCountItem,
        document.createElement("br"),
        likedByTitleItem,
        likedByListWrapper
      );

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.error(err);
    });
};

const renderLoading = (isLoading, buttonElement, defaultText = "Сохранить") => {
  if (isLoading) {
    buttonElement.textContent = "Сохранение...";
  } else {
    buttonElement.textContent = defaultText;
  }
};

const handleLikeClick = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains(
    "card__like-button_is-active"
  );

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      likeCard(likeButton);

      const likeCounter = likeButton
        .closest(".card")
        .querySelector(".card__like-count");

      if (likeCounter) {
        likeCounter.textContent = updatedCardData.likes.length;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const handleDeleteClick = (cardElement, cardId) => {
  deleteCardFromServer(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.error(err);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);

  updateUserInfo(profileTitleInput.value, profileDescriptionInput.value)
    .then((updatedData) => {
      profileTitle.textContent = updatedData.name;
      profileDescription.textContent = updatedData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);

  updateUserAvatar(avatarInput.value)
    .then((updatedData) => {
      profileAvatar.style.backgroundImage = `url(${updatedData.avatar})`;

      avatarForm.reset();
      
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton, "Создать");

  addNewCard(cardNameInput.value, cardLinkInput.value)
    .then((newCardData) => {
      placesWrap.prepend(
        createCardElementWithInfo(
          newCardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) => handleLikeClick(likeButton, newCardData._id),
            onDeleteCard: (cardElement) => handleDeleteClick(cardElement, newCardData._id),
            onInfoClick: handleCardInfoClick
          }
        )
      );

      cardForm.reset();
      
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, "Создать");
    });
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

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((data) => {
      placesWrap.append(
        createCardElementWithInfo(
          data, 
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) => handleLikeClick(likeButton, data._id),
            onDeleteCard: (cardElement) => handleDeleteClick(cardElement, data._id),
            onInfoClick: handleCardInfoClick
          },
          userData._id
        )
      );
    });
  })
  .catch((err) => {
    console.error(err);
  });

enableValidation(validationConfig);

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});








