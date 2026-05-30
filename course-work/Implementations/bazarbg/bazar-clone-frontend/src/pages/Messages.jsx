import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  Bell,
  Heart,
  Menu,
  MessageCircle,
  Search,
  Send,
  Settings,
  UserRound,
  X
} from "lucide-react";
import { apiRequest, getStoredUser } from "../api";
import { logout } from "../auth";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function Messages() {
  const user = getStoredUser();

  const [messages, setMessages] = useState([]);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages(silent = false) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data = await apiRequest("/messages/me");
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function loadConversation(contactId, silent = false) {
    try {
      if (!silent) {
        setChatLoading(true);
      }

      const data = await apiRequest(`/messages/conversation/${contactId}`);
      setConversationMessages(data);

      await apiRequest(`/messages/conversation/${contactId}/read`, {
        method: "PUT"
      });

      window.dispatchEvent(new Event("authChanged"));
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) {
        setChatLoading(false);
      }
    }
  }

  async function sendReply(event) {
    event.preventDefault();

    if (!selectedContact) {
      alert("Избери разговор.");
      return;
    }

    if (!replyText.trim()) {
      alert("Напиши съобщение.");
      return;
    }

    try {
      await apiRequest("/messages/", {
        method: "POST",
        body: JSON.stringify({
          receiver_id: selectedContact.id,
          ad_id: null,
          message_text: replyText
        })
      });

      setReplyText("");

      await loadConversation(selectedContact.id, true);
      await loadMessages(true);
    } catch (err) {
      alert(err.message);
    }
  }

  function getOtherUser(message) {
    if (message.sender_id === user.id) {
      return message.receiver;
    }

    return message.sender;
  }

  const conversations = useMemo(() => {
    const grouped = {};

    messages.forEach((message) => {
      const otherUser = getOtherUser(message);

      if (!otherUser) {
        return;
      }

      if (!grouped[otherUser.id]) {
        grouped[otherUser.id] = {
          user: otherUser,
          latestMessage: message,
          unreadCount: 0,
          totalMessages: 0
        };
      }

      grouped[otherUser.id].totalMessages += 1;

      if (
        message.receiver_id === user.id &&
        message.is_read === false
      ) {
        grouped[otherUser.id].unreadCount += 1;
      }

      const currentLatestDate = new Date(grouped[otherUser.id].latestMessage.created_at);
      const messageDate = new Date(message.created_at);

      if (messageDate > currentLatestDate) {
        grouped[otherUser.id].latestMessage = message;
      }
    });

    return Object.values(grouped)
      .filter((conversation) => {
        if (!search.trim()) {
          return true;
        }

        const value = search.toLowerCase();

        return (
          conversation.user.username?.toLowerCase().includes(value) ||
          conversation.latestMessage.message_text?.toLowerCase().includes(value)
        );
      })
      .sort((a, b) => {
        return new Date(b.latestMessage.created_at) - new Date(a.latestMessage.created_at);
      });
  }, [messages, search, user.id]);

  function openConversation(conversation) {
    setSelectedContact(conversation.user);
    loadConversation(conversation.user.id);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const inboxInterval = setInterval(() => {
      loadMessages(true);
    }, 5000);

    return () => {
      clearInterval(inboxInterval);
    };
  }, []);

  useEffect(() => {
    if (!selectedContact) {
      return;
    }

    const chatInterval = setInterval(() => {
      loadConversation(selectedContact.id, true);
      loadMessages(true);
    }, 2500);

    return () => {
      clearInterval(chatInterval);
    };
  }, [selectedContact]);

  return (
    <div className="bazar-profile-page">


      <div className="profile-breadcrumb">
        <strong>Моят Базар</strong>
        <span>›</span>
        <strong>Моите съобщения</strong>
      </div>

      <div className="profile-warning">
        <span>Не разкривай банкови данни при сделки в BAZAR</span>
        <Link to="/help/safety" className="warning-more-link">
            Виж повече »
        </Link>
        <X size={24} />
      </div>

      <div className="messages-profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-menu-section">
            <h3>
              <Menu size={18} />
              Моят профил:
            </h3>

            <Link to="/my-ads">Моите обяви</Link>
            <Link to="/messages" className="active">Съобщения</Link>
            <a href="#">Известия</a>
            <a href="#">Портфейл</a>
            <a href="#">Доставка</a>
          </div>

          <div className="profile-menu-section">
            <h3>
              <Heart size={19} />
              Любими:
            </h3>

            <Link to="/favorites">Обяви</Link>
            <a href="#">Търсения</a>
            <a href="#">Потребители</a>
          </div>

          <div className="profile-menu-section muted-section">
            <Link to="/settings">
              <Settings size={17} />
              Настройки
            </Link>

            <button type="button" onClick={logout}>
              Изход
            </button>
          </div>

          <div className="premium-box">
            <div className="premium-pill">Premium</div>

            <ul>
              <li>Одобрен публичен профил</li>
              <li>Разширени функционалности</li>
              <li>Възможност за избор на ТОП оферти</li>
              <li>Едновременни действия с до 200 обяви</li>
              <li>Създаване на поддомейн</li>
            </ul>

            <button type="button">АКТИВИРАЙ</button>
          </div>

          <div className="econt-box">
            <span>Доставки с 10% отстъпка от</span>
            <strong>ЕКОНТ</strong>
            <span>+ подарък</span>
          </div>
        </aside>

        <main className="messages-panel-classic">
          <div className="messages-tabs-row">
            <div className="messages-tabs">
              <button type="button" className="active">
                Текущи съобщения: {messages.length}
              </button>

              <button type="button">
                <Archive size={14} />
                Архивирани: 0
              </button>

              <button type="button">
                Блокирани
              </button>
            </div>

            <div className="messages-search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Търсене..."
              />
              <Search size={20} />
            </div>
          </div>

          <div className="messages-retention">
            Съобщенията се съхраняват в продължение на 90 дни.
          </div>

          {!selectedContact ? (
            <>
              <div className="messages-table-head">
                <span></span>
                <span>Подател</span>
                <span>Заглавие</span>
                <span>Дата</span>
              </div>

              {loading && <div className="classic-state">Зареждане...</div>}
              {error && <div className="classic-error">{error}</div>}

              {!loading && conversations.length === 0 && (
                <div className="no-messages-title">Нямаш съобщения.</div>
              )}

              <div className="conversation-list">
                {conversations.map((conversation) => {
                  const latest = conversation.latestMessage;
                  const incoming = latest.receiver_id === user.id;

                  return (
                    <button
                      key={conversation.user.id}
                      type="button"
                      className={`conversation-row ${conversation.unreadCount > 0 ? "unread" : ""}`}
                      onClick={() => openConversation(conversation)}
                    >
                      <span className="conversation-check"></span>

                      <span className="conversation-sender">
                        {conversation.user.username}
                        {conversation.unreadCount > 0 && (
                          <b>{conversation.unreadCount}</b>
                        )}
                      </span>

                      <span className="conversation-title">
                        {incoming ? "Получено: " : "Изпратено: "}
                        {latest.message_text}
                      </span>

                      <span className="conversation-date">
                        {formatDate(latest.created_at)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <section className="chat-classic">
              <div className="chat-header-classic">
                <button
                  type="button"
                  className="back-to-inbox"
                  onClick={() => {
                    setSelectedContact(null);
                    setConversationMessages([]);
                    loadMessages(true);
                  }}
                >
                  ← Назад към съобщенията
                </button>

                <div>
                  <strong>Разговор с {selectedContact.username}</strong>
                  <span>Обновява се автоматично</span>
                </div>
              </div>

              <div className="chat-body-classic">
                {chatLoading && (
                  <div className="classic-state">Зареждане на разговора...</div>
                )}

                {conversationMessages.map((message) => {
                  const mine = message.sender_id === user.id;

                  return (
                    <div
                      key={message.id}
                      className={`chat-bubble-row ${mine ? "mine" : "theirs"}`}
                    >
                      <div className="chat-bubble">
                        <div className="chat-bubble-author">
                          {mine ? "Ти" : selectedContact.username}
                          <span>{formatDate(message.created_at)}</span>
                        </div>

                        <p>{message.message_text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="chat-form-classic" onSubmit={sendReply}>
                <textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Напиши съобщение..."
                  rows={3}
                />

                <button type="submit">
                  <Send size={18} />
                  Изпрати
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
