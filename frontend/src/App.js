import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000';

function Example1() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/example/1`);
      if (!response.ok) {
        setData([]);
        return;
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Листинг результатов</h1>
      </div>

      <div>
        {data.length === 0 ? (
          <p>0 результатов</p>
        ) : (
          data.map((item, index) => (
            <div key={index} className="item">
              <h3>{item.name}</h3>
              <p>Происхождение: {item.origin}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Example2() {
  const [responseData, setResponseData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    try {
      const response = await fetch(`${API_BASE}/example/2?page=${page}&limit=3`);
      if (!response.ok) {
        setResponseData(null);
        return;
      }
      const result = await response.json();
      setResponseData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponseData(null);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!responseData) {
    return (
      <div className="container">
        <div className="header">
          <h1>Листинг результатов</h1>
        </div>
        <div>
          <p>0 результатов</p>
        </div>
      </div>
    );
  }

  const { data, total, page, limit, total_pages } = responseData;

  return (
    <div className="container">
      <div className="header">
        <h1>Листинг результатов</h1>
      </div>

      <div>
        <p>Показано {data.length} из {total} результатов (страница {page} из {total_pages})</p>

        {data.length === 0 ? (
          <p>0 результатов</p>
        ) : (
          data.map((item, index) => (
            <div key={item.id} className="item" style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
              <h3>{item.name}</h3>
              <p>Происхождение: {item.origin}</p>
            </div>
          ))
        )}

        <div style={{marginTop: '20px'}}>
          {Array.from({length: total_pages}, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: pageNum === currentPage ? '#007bff' : '#f8f9fa',
                color: pageNum === currentPage ? 'white' : 'black',
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Example3() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalFound, setTotalFound] = useState(0);

  useEffect(() => {
    fetchProducts('');
  }, []);

  const fetchProducts = async (search) => {
    try {
      const url = search ? `${API_BASE}/example/3?search=${encodeURIComponent(search)}` : `${API_BASE}/example/3`;
      const response = await fetch(url);
      if (!response.ok) {
        setProducts([]);
        return;
      }
      const result = await response.json();
      setProducts(result.products);
      setTotalFound(result.total_found);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalFound(0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchProducts('');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Поиск товаров</h1>
      </div>

      <div>
        <form onSubmit={handleSearch} style={{marginBottom: '20px'}}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите название товара для поиска..."
            style={{
              padding: '8px',
              width: '300px',
              marginRight: '10px',
              border: '1px solid #ccc'
            }}
          />
          <button type="submit" style={{padding: '8px 16px', marginRight: '10px'}}>
            Найти
          </button>
          <button type="button" onClick={handleClearSearch} style={{padding: '8px 16px'}}>
            Очистить
          </button>
        </form>

        <p>Найдено товаров: {totalFound}</p>

        {products.length === 0 ? (
          <p>Товары не найдены</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="item" style={{
              border: '1px solid #ccc',
              padding: '15px',
              margin: '10px 0',
              borderRadius: '5px'
            }}>
              <h3>{product.name}</h3>
              <p><strong>Цена:</strong> ${product.price}</p>
              <p><strong>Категория:</strong> {product.category}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Example5() {
  const [documents, setDocuments] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [mongoQuery, setMongoQuery] = useState('');
  const [mongoError, setMongoError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`${API_BASE}/example/5`);
      if (!response.ok) {
        setDocuments([]);
        return;
      }
      const result = await response.json();
      setDocuments(result);
      setSearchResult(result);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };


  const executeSearch = (e) => {
    e.preventDefault();

    if (!searchKey.trim() || !searchValue.trim()) {
      setSearchResult(documents);
      return;
    }

    try {
      const path = searchKey.trim().split('.');
      const filteredDocuments = documents.filter(doc => {
        let value = doc;

        for (const key of path) {
          if (value === null || value === undefined || typeof value !== 'object' || !(key in value)) {
            return false;
          }
          value = value[key];
        }

        return String(value) === searchValue.trim();
      });

      setSearchResult(filteredDocuments);
      setMongoQuery('');
      setMongoError('');
    } catch (error) {
      setSearchResult([]);
    }
  };

  const executeMongoQuery = (e) => {
    e.preventDefault();
    setMongoError('');

    if (!mongoQuery.trim()) {
      setSearchResult(documents);
      return;
    }

    try {
      let query = JSON.parse(mongoQuery);

      // Если запрос является массивом (aggregation pipeline), берем первый элемент
      if (Array.isArray(query) && query.length > 0) {
        query = query[0];
      }

      const filteredDocuments = documents.filter(doc => {
        return matchesQuery(doc, query);
      });

      setSearchResult(filteredDocuments);
      setSearchKey('');
      setSearchValue('');
    } catch (error) {
      setMongoError(`Ошибка парсинга JSON: ${error.message}`);
    }
  };

  const matchesQuery = (doc, query) => {
    for (const [path, condition] of Object.entries(query)) {
      const value = getValueByPath(doc, path);

      if (!matchesCondition(value, condition)) {
        return false;
      }
    }
    return true;
  };

  const getValueByPath = (obj, path) => {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value === null || value === undefined || typeof value !== 'object' || !(key in value)) {
        return undefined;
      }
      value = value[key];
    }

    return value;
  };

  const matchesCondition = (value, condition) => {
    if (typeof condition !== 'object' || condition === null) {
      return value === condition;
    }

    for (const [operator, operand] of Object.entries(condition)) {
      switch (operator) {
        case '$gte':
          return Number(value) >= Number(operand);
        case '$lte':
          return Number(value) <= Number(operand);
        case '$gt':
          return Number(value) > Number(operand);
        case '$lt':
          return Number(value) < Number(operand);
        case '$eq':
          return value === operand;
        case '$ne':
          return value !== operand;
        default:
          return false;
      }
    }

    return false;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>MongoDB</h1>
      </div>

      <div>
        <div style={{display: 'flex', gap: '40px', marginBottom: '20px'}}>
          <div style={{flex: '1'}}>
            <form onSubmit={executeSearch}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Поиск по ключу и значению:
                </label>
                <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px'}}>
                  <input
                    type="text"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="ключ"
                    style={{
                      width: '150px',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="значение"
                    style={{
                      width: '150px',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Поиск
                </button>
              </div>
            </form>
          </div>

          <div style={{flex: '1'}}>
            <form onSubmit={executeMongoQuery}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  MongoDB Query:
                </label>
                <textarea
                  value={mongoQuery}
                  onChange={(e) => setMongoQuery(e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    marginBottom: '10px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Выполнить MongoDB Query
                </button>
              </div>
            </form>
          </div>
        </div>

        {mongoError && (
          <div style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {mongoError}
          </div>
        )}


        <h3>Результат поиска ({searchResult.length} документов):</h3>
        {searchResult.length > 0 ? (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            <pre>{JSON.stringify(searchResult, null, 2)}</pre>
          </div>
        ) : (
          <p>Документы не найдены</p>
        )}
      </div>
    </div>
  );
}

function Example4() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage('Пожалуйста, заполните все поля');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(`${API_BASE}/example/4`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`${result.message}. ID: ${result.id}`);
        setIsSuccess(true);
        setTitle('');
        setDescription('');
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Ошибка при создании тикета');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Ошибка соединения с сервером');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Создание тикета</h1>
      </div>

      <div>
        <form onSubmit={handleSubmit} style={{maxWidth: '600px'}}>
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Заголовок тикета:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок тикета"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
              Описание проблемы:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробно опишите проблему или запрос"
              rows="6"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Создание...' : 'Создать тикет'}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
            color: isSuccess ? '#155724' : '#721c24',
            border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === '/example/1') {
    return <Example1 />;
  } else if (path === '/example/2') {
    return <Example2 />;
  } else if (path === '/example/3') {
    return <Example3 />;
  } else if (path === '/example/4') {
    return <Example4 />;
  } else if (path === '/example/5') {
    return <Example5 />;
  } else {
    return <Example1 />;
  }
}

export default App;