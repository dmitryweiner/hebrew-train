// Заголовок второстепенной страницы с кнопкой «Назад»

import { useNavigate } from 'react-router';

const PageHeader = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <button className="btn btn-outline-secondary btn-exit" onClick={() => navigate('/')}>
        ← В меню
      </button>
      <h1 className="h3 mb-0">{title}</h1>
    </header>
  );
};

export default PageHeader;
