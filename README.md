# EHVOLUS · Site oficial

Código do site oficial da EHVOLUS, servido em [ehvolus.com.br](https://ehvolus.com.br).

Site 100% estático: HTML, CSS e JavaScript vanilla, sem etapa de build. A publicação é feita pelo GitHub Pages a partir da branch `main`.

## Rodar localmente

Qualquer servidor estático serve a raiz do repositório. Com Python instalado:

```bash
python3 -m http.server 8080
```

Abrir `http://localhost:8080/`.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `index.html` | A home (página única) |
| `assets/` | CSS, JS, fontes e imagens |
| `robots.txt`, `sitemap.xml` | Metadados de indexação |

## Publicação

Alterações na branch `main` são publicadas automaticamente pelo GitHub Pages em [ehvolus.com.br](https://ehvolus.com.br), em um ou dois minutos após o push.

### Fluxo de edição (mantenedores)

1. Clone por SSH e confira a identidade dos commits: o e-mail de autor deve ser o **noreply do GitHub** (`<id>+<usuario>@users.noreply.github.com`, disponível em Settings, Emails, com "Keep my email addresses private" ativado). Este repositório é público e o e-mail de cada commit fica visível para sempre.
2. Edite os arquivos e confira o resultado localmente (`python3 -m http.server 8080`). O site não tem build: o que está no repositório é o que vai ao ar.
3. Commit com mensagem curta em português descrevendo a mudança, e push na `main`. O push publica.

### O que não fazer

- **Não apague nem edite o arquivo `CNAME`.** Ele é a configuração do domínio; sem ele, ehvolus.com.br sai do ar.
- **Não suba documento interno** (brief, handoff, planejamento, dados de contato). Este repositório carrega somente o que o navegador serve.
- **Não suba segredo nenhum** (token, chave, senha). Repositório público não tem "arquivo escondido".
- Em dúvida sobre uma mudança grande, publique primeiro num fork ou branch e peça uma segunda opinião antes do push na `main`.

## Direitos

© EHVOLUS. Todos os direitos reservados. O conteúdo deste repositório (marca, textos, imagens e código) não está licenciado para reuso.
