import {Server} from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';
import {DragonPoo, DragonPooKids} from './Game';

const server = Server({games: [DragonPoo, DragonPooKids]});
const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '.');
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT as number, () => {
    server.app.use(
        async (ctx, next) => await serve(frontEndAppBuildPath)(
            Object.assign(ctx, {path: 'index.html'}),
            next
        )
    )
});