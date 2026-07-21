import { FiZap } from 'react-icons/fi';
import { RiSparklingLine, RiFocus3Line, RiRobot2Line } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features__intro">
          <h2>
            {t('features.titlePart1')} <br />
            <span>{t('features.titlePart2')}</span>
          </h2>
          <p>
            {t('features.description')}
          </p>
        </div>

        <div className="features__grid">
          <div className="features__list">
            <div className="features__item">
              <div className="features__icon features__icon--primary"><RiSparklingLine size={24} /></div>
              <div>
                <h3>{t('features.item1Title')}</h3>
                <p>{t('features.item1Text')}</p>
              </div>
            </div>
            <div className="features__item">
              <div className="features__icon features__icon--accent"><RiFocus3Line size={24} /></div>
              <div>
                <h3>{t('features.item2Title')}</h3>
                <p>{t('features.item2Text')}</p>
              </div>
            </div>
            <div className="features__item">
              <div className="features__icon features__icon--blue"><RiRobot2Line size={24} /></div>
              <div>
                <h3>{t('features.item3Title')}</h3>
                <p>{t('features.item3Text')}</p>
              </div>
            </div>
          </div>

          <div className="features__chat">
            <div className="features__chat-header">
              <div className="features__chat-avatar"><RiRobot2Line size={20} /></div>
              <div>
                <h4>{t('features.chatTitle')}</h4>
                <p>{t('features.chatStatus')}</p>
              </div>
            </div>

            <div className="features__chat-body">
              <div className="features__msg">
                <div className="features__msg-avatar"><RiRobot2Line size={14} /></div>
                <div className="features__bubble features__bubble--bot">
                  {t('features.chatBotMessage')}
                </div>
              </div>
              <div className="features__msg features__msg--user">
                <div className="features__msg-avatar features__msg-avatar--accent">AM</div>
                <div className="features__bubble features__bubble--user">
                  {t('features.chatUserMessage')}
                </div>
              </div>
              <div className="features__msg">
                <div className="features__msg-avatar"><RiRobot2Line size={14} /></div>
                <div className="features__bubble features__bubble--bot">
                  <span className="features__bubble-tag"><FiZap size={14} /> {t('features.chatReplyTag')}</span>
                  {t('features.chatReply')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
