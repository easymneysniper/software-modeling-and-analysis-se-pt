import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import kurierImage from "../assets/kurier.png";

export default function Delivery() {
  return (
    <div className="delivery-page">
      <section className="delivery-hero-image">
        <img src={kurierImage} alt="Доставки с Еконт" />
      </section>

      <section className="delivery-content">
        <div className="delivery-point">
          <span className="delivery-plus">
            <Plus size={22} strokeWidth={4} />
          </span>

          <p>
            Bazar.bg е <strong>най-големият сайт</strong> за безплатни обяви в България!
          </p>
        </div>

        <div className="delivery-point">
          <span className="delivery-plus">
            <Plus size={22} strokeWidth={4} />
          </span>

          <p>
            Можете да публикувате обяви <strong>напълно безплатно!</strong>
          </p>
        </div>

        <div className="delivery-button-row">
          <Link to="/create-ad" className="delivery-main-button">
            + ДОБАВИ БЕЗПЛАТНА ОБЯВА
          </Link>
        </div>

        <div className="delivery-point">
          <span className="delivery-plus">
            <Plus size={22} strokeWidth={4} />
          </span>

          <p>
            <strong>Над 2 000 000</strong> потребители ползват Bazar.bg и ежедневно се
            сключват хиляди сделки.
          </p>
        </div>

        <div className="delivery-point">
          <span className="delivery-plus">
            <Plus size={22} strokeWidth={4} />
          </span>

          <p>
            За да сме Ви максимално полезни, чрез Bazar.bg Ви предоставяме и възможността
            да ползвате услугите на <strong>ЕКОНТ с 10% отстъпка!</strong>
          </p>
        </div>

        <div className="delivery-point">
          <span className="delivery-plus">
            <Plus size={22} strokeWidth={4} />
          </span>

          <p>
            И допълнително при всяка продажба получавате ПОДАРЪК -
            <strong> паричен бонус в портфейла!</strong>
          </p>
        </div>

        <div className="delivery-button-row">
          <button type="button" className="delivery-main-button">
            + СЪЗДАЙ ТОВАРИТЕЛНИЦА С 10% ОТСТЪПКА
          </button>
        </div>

        <h2>Екипът на Bazar.bg Ви пожелава успешни сделки!</h2>
      </section>
    </div>
  );
}