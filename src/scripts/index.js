/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import "../pages/index.css";
import { getUserInfo, getCardList, updateUserInfo, addNewCard, deleteCardFromServer, updateUserAvatar, changeLikeCardStatus } from "./components/api.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
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
const infoDescription = cardInfoModalWindow.querySelector(".popup__info-description");
const infoDate = cardInfoModalWindow.querySelector(".popup__info-date");
const infoOwner = cardInfoModalWindow.querySelector(".popup__info-owner");
const infoLikesCount = cardInfoModalWindow.querySelector(".popup__info-likes-count");
const infoLikedByList = cardInfoModalWindow.querySelector(".popup__info-liked-by");

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

      const dateObj = new Date(targetCard.createdAt || Date.now());
      const formattedDate = dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) + " г.";

      const dlContainer = cardInfoModalWindow.querySelector(".popup__info");
      const h4Title = cardInfoModalWindow.querySelector(".popup__text");
      const ulList = cardInfoModalWindow.querySelector(".popup__list");

      if (dlContainer && !cardInfoModalWindow.querySelector(".popup__info-item")) {
        dlContainer.innerHTML = "";
        ulList.innerHTML = "";
        
        const infoTemplate = document.querySelector("#popup-info-definition-template").content;

        const infoData = [
          { term: "Описание:", desc: targetCard.name || "—" },
          { term: "Дата создания:", desc: formattedDate },
          { term: "Владелец:", desc: targetCard.owner ? targetCard.owner.name : "Неизвестен" },
          { term: "Количество лайков:", desc: targetCard.likes ? targetCard.likes.length : 0 }
        ];

        infoData.forEach(item => {
          const infoElement = infoTemplate.cloneNode(true);
          const termNode = infoElement.querySelector(".popup__info-term");
          const descNode = infoElement.querySelector(".popup__info-description");

          termNode.textContent = item.term;
          descNode.textContent = item.desc;

          descNode.style.display = "inline";
          descNode.style.marginLeft = "8px";

          dlContainer.appendChild(infoElement);
        });
      } 
      else {
        if (infoDescription) infoDescription.textContent = targetCard.name || "—";
        if (infoDate) infoDate.textContent = formattedDate;
        if (infoOwner) infoOwner.textContent = targetCard.owner ? targetCard.owner.name : "Неизвестен";
        if (infoLikesCount) infoLikesCount.textContent = targetCard.likes ? targetCard.likes.length : 0;

        [infoDescription, infoDate, infoOwner, infoLikesCount].forEach(node => {
          if (node) {
            node.style.display = "inline";
            node.style.marginLeft = "8px";
          }
        });
      }

      if (ulList) {
        ulList.innerHTML = "";
        
        if (targetCard.likes && targetCard.likes.length > 0) {
          if (h4Title) h4Title.textContent = "Лайкнули:";
          
          const badgeTemplate = document.querySelector("#popup-info-user-preview-template").content;

          targetCard.likes.forEach(user => {
            const badgeElement = badgeTemplate.cloneNode(true);
            const li = badgeElement.querySelector(".popup__list-item_type_badge");
            li.textContent = user.name;
            ulList.appendChild(badgeElement);
          });
        } else {
          if (h4Title) h4Title.textContent = "Лайкнули:";
          const noLikesMessage = document.createElement("li");
          noLikesMessage.style.color = "#666";
          noLikesMessage.style.listStyle = "none";
          noLikesMessage.textContent = "Пока никто не лайкнул";
          ulList.appendChild(noLikesMessage);
        }
      }

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

const handleLikeClick = (likeButton, cardId, userId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      const cardElement = likeButton.closest(".card");
      
      likeCard(cardElement, updatedCardData, userId);
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
      const currentUserId = newCardData.owner._id;
      placesWrap.prepend(
        createCardElement(
          newCardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) => handleLikeClick(likeButton, newCardData._id, currentUserId),
            onDeleteCard: (cardElement) => handleDeleteClick(cardElement, newCardData._id),
            onInfoClick: handleCardInfoClick
          },
          currentUserId
        )
      );
      
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
        createCardElement(
          data, 
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) => handleLikeClick(likeButton, data._id, userData._id),
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









