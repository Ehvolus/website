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

Alterações na branch `main` são publicadas automaticamente pelo GitHub Pages. O fluxo de edição e revisão está documentado para os mantenedores do repositório.

## Direitos

© EHVOLUS. Todos os direitos reservados. O conteúdo deste repositório (marca, textos, imagens e código) não está licenciado para reuso.
