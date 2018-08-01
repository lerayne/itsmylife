Пакет SSR-bootstrap был выделен мною из нескольких своих проектов чтобы при желании обновить что-то
в его коде не нужно было делать это в нескольких проектах одновременно

#### Что он делает?

Предоставляет базовые функции серверного рендеринга для использования изоморфных приложениях, а
именно:

createStaticGenerator - функция генерирующая на выходе листенер URL-вызова express, например:
```
import {createStaticGenerator} from 'ssr-bootstrap'

const generateStaticPage = createStaticGenerator({
    ...params
})

app.get('/*', generateStaticPage)
```
Как видно, на вход она принимает ряд простых параметров, а на выходе мы получаем готовую функцию
серверного рендеринга с управлением URL-роутингом, логином, инициализацией redux-контейнеров итд.

#### Интерфейс функции 
(дополняется по мере реализации функционала):

**template:** function(dynamicHTML, initialReduxState) -> HTML String  
**route:** function(onEnter, onChange) -> React router's root route  
**jwtSecret:** String (JSON web token secret key для логина)  
**reducers:** обычный для redux объект с редюсерами (_не_ то что возвращает функция combineReduces, а то, 
что она принимает)