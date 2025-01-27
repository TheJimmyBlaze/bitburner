

export const drawProgress = (
    percent,
    options = {}
) => {

    const {
        open = '[',
        close = ']',
        mark = '|',
        noMark = ' ',
        drawWidth = 16
    } = options;

    let body = '';
    for(let i = 0; i < drawWidth; i++) {

        if (i < percent * drawWidth) {
            body += mark;
            continue;
        }

        body += noMark;
    };

    return `${open}${body}${close}`;
};