import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LangContext.jsx';
import { Bezoekerswall } from './Bezoekerswall.jsx';
import { FotoCheckIn } from './FotoCheckIn.jsx';
import { Sfeercheck } from './Sfeercheck.jsx';
import './Interactie.css';

export default function InteractiePage() {
  const { t } = useLanguage();

  return (
    <div className="page-interactie">
      <Link className="interactie-back tap-scale" to="/">
        {t('interactie.backHome')}
      </Link>
      <h1 className="page-title">{t('interactie.title')}</h1>
      <p className="interactie-intro">{t('interactie.intro')}</p>
      <FotoCheckIn />
      <Sfeercheck />
      <Bezoekerswall />
    </div>
  );
}
